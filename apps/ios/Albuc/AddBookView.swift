import SwiftUI

struct AddBookView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss

    @State private var query = ""
    @State private var results: [SearchHit] = []
    @State private var selected: SearchHit?
    @State private var status: BookStatus = .reading
    @State private var isSearching = false
    @State private var isSaving = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            Group {
                if let selected {
                    Form {
                        Section {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(selected.title)
                                    .font(.headline)
                                    .fontDesign(.serif)
                                Text(selected.authorLine)
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                        }
                        Picker("Status", selection: $status) {
                            ForEach(BookStatus.allCases) { item in
                                Text(item.title).tag(item)
                            }
                        }
                    }
                } else {
                    List(results) { hit in
                        Button {
                            selected = hit
                        } label: {
                            HStack(spacing: 12) {
                                cover(hit)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(hit.title)
                                        .foregroundStyle(.primary)
                                    Text(hit.authorLine)
                                        .font(.subheadline)
                                        .foregroundStyle(.secondary)
                                }
                            }
                        }
                    }
                    .overlay {
                        if results.isEmpty && !isSearching {
                            ContentUnavailableView("Search Open Library", systemImage: "magnifyingglass", description: Text("Title, author, or ISBN."))
                        }
                    }
                }
            }
            .navigationTitle(selected == nil ? "Add a Book" : "Add to Library")
            .navigationBarTitleDisplayMode(.inline)
            .searchable(text: $query, prompt: "Title, author, or ISBN")
            .onSubmit(of: .search) { Task { await search() } }
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(selected == nil ? "Close" : "Back") {
                        if selected != nil { selected = nil } else { dismiss() }
                    }
                }
                if selected != nil {
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Add") { Task { await add() } }
                            .disabled(isSaving)
                    }
                }
            }
            .alert("Add a book", isPresented: Binding(
                get: { errorMessage != nil },
                set: { if !$0 { errorMessage = nil } }
            )) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(errorMessage ?? "")
            }
        }
    }

    private func cover(_ hit: SearchHit) -> some View {
        AsyncImage(url: hit.coverURL) { phase in
            switch phase {
            case .success(let image):
                image.resizable().scaledToFill()
            default:
                Color(white: 0.93)
            }
        }
        .frame(width: 36, height: 54)
        .clipShape(RoundedRectangle(cornerRadius: 3, style: .continuous))
    }

    private func search() async {
        let trimmed = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard trimmed.count >= 3 else { return }
        isSearching = true
        defer { isSearching = false }
        do {
            results = try await model.client().search(query: trimmed)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func add() async {
        guard let selected else { return }
        isSaving = true
        defer { isSaving = false }
        do {
            _ = try await model.client().addBook(selected, status: status)
            dismiss()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
