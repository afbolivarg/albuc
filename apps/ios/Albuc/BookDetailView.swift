import SwiftUI

struct BookDetailView: View {
    @Environment(AppModel.self) private var model
    var bookId: String

    @State private var book: LibraryBook?
    @State private var errorMessage: String?
    @State private var isSaving = false

    var body: some View {
        Group {
            if let book {
                ScrollView {
                    VStack(spacing: 20) {
                        BookCover(book: book)
                            .frame(width: 168)
                            .padding(.top, 8)

                        VStack(spacing: 4) {
                            Text(book.title)
                                .font(.title2.weight(.semibold))
                                .fontDesign(.serif)
                                .multilineTextAlignment(.center)
                            Text(book.authorLine)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                            if let year = book.publishYear {
                                Text("First published \(year)")
                                    .font(.footnote)
                                    .foregroundStyle(.tertiary)
                            }
                        }

                        rating(book)
                    }
                    .padding(.horizontal, 20)
                    .frame(maxWidth: .infinity)

                    Form {
                        Picker("Status", selection: statusBinding(book)) {
                            ForEach(BookStatus.allCases) { status in
                                Text(status.title).tag(status)
                            }
                        }
                        NavigationLink("Notes") {
                            NotesView(book: book) { updated in
                                self.book = updated
                            }
                        }
                        Toggle("Public note", isOn: visibilityBinding(book))
                        if book.visibility == .public, let share = book.shareUrl, let url = URL(string: share) {
                            ShareLink(item: url) {
                                Label("Share Note", systemImage: "square.and.arrow.up")
                            }
                        }
                    }
                    .frame(minHeight: 280)
                }
            } else {
                ProgressView()
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .task { await load() }
        .alert("Book", isPresented: Binding(
            get: { errorMessage != nil },
            set: { if !$0 { errorMessage = nil } }
        )) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(errorMessage ?? "")
        }
    }

    private func rating(_ book: LibraryBook) -> some View {
        HStack(spacing: 8) {
            ForEach(1...5, id: \.self) { star in
                Button {
                    Task { await setRating(book.rating == star ? 0 : star) }
                } label: {
                    Image(systemName: (book.rating ?? 0) >= star ? "star.fill" : "star")
                        .font(.title3)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("\(star) star")
            }
        }
        .foregroundStyle(.primary)
        .disabled(isSaving)
    }

    private func statusBinding(_ book: LibraryBook) -> Binding<BookStatus> {
        Binding(
            get: { book.status },
            set: { status in Task { await patch(["status": status.rawValue]) } }
        )
    }

    private func visibilityBinding(_ book: LibraryBook) -> Binding<Bool> {
        Binding(
            get: { book.visibility == .public },
            set: { isPublic in
                Task { await patch(["visibility": isPublic ? "public" : "private"]) }
            }
        )
    }

    private func load() async {
        if book != nil { return }
        do {
            book = try await model.client().book(id: bookId)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func setRating(_ rating: Int) async {
        await patch(["rating": rating])
    }

    private func patch(_ body: [String: Any]) async {
        isSaving = true
        defer { isSaving = false }
        do {
            book = try await model.client().updateBook(id: bookId, patch: body)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

struct NotesView: View {
    @Environment(AppModel.self) private var model
    var book: LibraryBook
    var onSave: (LibraryBook) -> Void

    @State private var text: String
    @State private var isSaving = false
    @State private var errorMessage: String?
    @Environment(\.dismiss) private var dismiss

    init(book: LibraryBook, onSave: @escaping (LibraryBook) -> Void) {
        self.book = book
        self.onSave = onSave
        _text = State(initialValue: book.noteMarkdown ?? "")
    }

    var body: some View {
        TextEditor(text: $text)
            .font(.body)
            .fontDesign(.serif)
            .padding(.horizontal, 8)
            .navigationTitle("Notes")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { Task { await save() } }
                        .disabled(isSaving)
                }
            }
            .alert("Notes", isPresented: Binding(
                get: { errorMessage != nil },
                set: { if !$0 { errorMessage = nil } }
            )) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(errorMessage ?? "")
            }
    }

    private func save() async {
        isSaving = true
        defer { isSaving = false }
        do {
            let updated = try await model.client().updateBook(
                id: book.id,
                patch: ["noteMarkdown": text]
            )
            onSave(updated)
            dismiss()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
