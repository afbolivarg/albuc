import SwiftUI

struct AskTurnView: Identifiable {
    let id = UUID()
    var role: String
    var content: String
    var sources: [AskSource] = []
}

struct AskView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss
    @State private var turns: [AskTurnView] = []
    @State private var draft = ""
    @State private var isAsking = false
    @State private var errorMessage: String?

    var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                if turns.isEmpty {
                    ContentUnavailableView(
                        "Ask your library",
                        systemImage: "text.bubble",
                        description: Text("Answers come from your notes, with the books they came from.")
                    )
                    .padding(.top, 48)
                } else {
                    LazyVStack(alignment: .leading, spacing: 22) {
                        ForEach(turns) { turn in
                            if turn.role == "user" {
                                Text(turn.content)
                                    .font(.body.weight(.medium))
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            } else {
                                VStack(alignment: .leading, spacing: 12) {
                                    Text(turn.content)
                                        .font(.body)
                                        .fontDesign(.serif)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                    if !turn.sources.isEmpty {
                                        VStack(alignment: .leading, spacing: 6) {
                                            ForEach(turn.sources) { source in
                                                Text("[\(source.n)] \(source.title)")
                                                    .font(.footnote)
                                                    .foregroundStyle(.secondary)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        if isAsking {
                            ProgressView()
                                .frame(maxWidth: .infinity, alignment: .leading)
                        }
                    }
                    .padding(20)
                }
            }
            Divider()
            HStack(alignment: .bottom, spacing: 8) {
                TextField("Ask about your notes", text: $draft, axis: .vertical)
                    .lineLimit(1...4)
                    .textFieldStyle(.plain)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
                    .background(.fill.tertiary, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
                Button {
                    Task { await ask() }
                } label: {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.system(size: 30))
                }
                .disabled(isAsking || draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
        }
        .navigationTitle("Ask")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Close") { dismiss() }
            }
        }
        .alert("Ask", isPresented: Binding(
            get: { errorMessage != nil },
            set: { if !$0 { errorMessage = nil } }
        )) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(errorMessage ?? "")
        }
    }

    private func ask() async {
        let question = draft.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !question.isEmpty else { return }
        draft = ""
        let history = turns.map { AskTurn(role: $0.role, content: $0.content) }
        turns.append(AskTurnView(role: "user", content: question))
        isAsking = true
        defer { isAsking = false }
        do {
            let answer = try await model.client().ask(question: question, history: history)
            turns.append(AskTurnView(role: "assistant", content: answer.answer, sources: answer.sources))
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
