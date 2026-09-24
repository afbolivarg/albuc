import SwiftUI

struct LibraryView: View {
    @Environment(AppModel.self) private var model
    @State private var books: [LibraryBook] = []
    @State private var status: BookStatus?
    @State private var query = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showSettings = false
    @State private var showAdd = false
    @State private var showAsk = false

    private let columns = [GridItem(.adaptive(minimum: 108, maximum: 160), spacing: 16)]

    var body: some View {
        NavigationStack {
            Group {
                if books.isEmpty && !isLoading {
                    ContentUnavailableView {
                        Label(query.isEmpty && status == nil ? "Your Albuc is empty" : "No books", systemImage: "books.vertical")
                    } description: {
                        Text(query.isEmpty && status == nil ? "Add a book when you're ready." : "Nothing matches this shelf.")
                    } actions: {
                        Button("Add a Book") { showAdd = true }
                    }
                } else {
                    ScrollView {
                        LazyVGrid(columns: columns, spacing: 22) {
                            ForEach(books) { book in
                                NavigationLink(value: book.id) {
                                    BookCover(book: book)
                                }
                                .buttonStyle(.plain)
                                .contextMenu {
                                    Button("Remove", systemImage: "trash", role: .destructive) {
                                        Task { await remove(book) }
                                    }
                                }
                            }
                        }
                        .padding(.horizontal, 16)
                        .padding(.top, 8)
                        .padding(.bottom, 24)
                    }
                }
            }
            .navigationTitle("Library")
            .navigationDestination(for: String.self) { id in
                BookDetailView(bookId: id)
            }
            .searchable(text: $query, prompt: "Search library")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button {
                        showSettings = true
                    } label: {
                        Image(systemName: "person.crop.circle")
                    }
                    .accessibilityLabel("Settings")
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Menu {
                        Picker("Status", selection: $status) {
                            Text("All").tag(BookStatus?.none)
                            ForEach(BookStatus.allCases) { item in
                                Text(item.title).tag(Optional(item))
                            }
                        }
                    } label: {
                        Image(systemName: "line.3.horizontal.decrease")
                    }
                    .accessibilityLabel("Filter")
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showAsk = true
                    } label: {
                        Image(systemName: "text.bubble")
                    }
                    .accessibilityLabel("Ask")
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showAdd = true
                    } label: {
                        Image(systemName: "plus")
                    }
                    .accessibilityLabel("Add a book")
                }
            }
            .refreshable { await load() }
            .sheet(isPresented: $showSettings) {
                SettingsView()
            }
            .sheet(isPresented: $showAdd, onDismiss: { Task { await load() } }) {
                AddBookView()
            }
            .sheet(isPresented: $showAsk) {
                NavigationStack { AskView() }
            }
            .task { await load() }
            .onChange(of: status) { _, _ in Task { await load() } }
            .onChange(of: query) { _, _ in Task { await load() } }
            .alert("Library", isPresented: Binding(
                get: { errorMessage != nil },
                set: { if !$0 { errorMessage = nil } }
            )) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(errorMessage ?? "")
            }
        }
    }

    private func load() async {
        isLoading = true
        defer { isLoading = false }
        do {
            books = try await model.client().books(status: status, query: query)
        } catch AlbucAPIError.unauthorized {
            model.signOut()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func remove(_ book: LibraryBook) async {
        do {
            try await model.client().deleteBook(id: book.id)
            books.removeAll { $0.id == book.id }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

struct BookCover: View {
    var book: LibraryBook

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            cover
                .frame(maxWidth: .infinity)
                .aspectRatio(2 / 3, contentMode: .fit)
                .clipShape(RoundedRectangle(cornerRadius: 6, style: .continuous))
                .shadow(color: .black.opacity(0.18), radius: 8, y: 4)
            Text(book.title)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(.primary)
                .lineLimit(2)
                .multilineTextAlignment(.leading)
            Text(book.authorLine)
                .font(.caption)
                .foregroundStyle(.secondary)
                .lineLimit(1)
        }
    }

    @ViewBuilder
    private var cover: some View {
        if let raw = book.coverUrl, let url = URL(string: raw) {
            AsyncImage(url: url) { phase in
                switch phase {
                case .success(let image):
                    image.resizable().scaledToFill()
                default:
                    placeholder
                }
            }
        } else {
            placeholder
        }
    }

    private var placeholder: some View {
        ZStack {
            Color(white: 0.93)
            Text(book.title)
                .font(.footnote.weight(.semibold))
                .multilineTextAlignment(.center)
                .padding(8)
                .foregroundStyle(.secondary)
        }
    }
}
