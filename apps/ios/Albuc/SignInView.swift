import SwiftUI

struct SignInView: View {
    @Environment(AppModel.self) private var model
    @State private var email = ""
    @State private var link = ""
    @State private var sent = false
    @State private var isWorking = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Email", text: $email)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                } header: {
                    Text("Sign in")
                } footer: {
                    Text("We'll email you a link. It opens Albuc, or you can paste it here.")
                }

                if sent {
                    Section("Sign-in link") {
                        TextField("Paste the link", text: $link, axis: .vertical)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                    }
                }
            }
            .navigationTitle("Albuc")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button(sent ? "Continue" : "Send Link") {
                        Task { await submit() }
                    }
                    .disabled(isWorking || (sent ? link.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty : !email.contains("@")))
                }
            }
            .overlay {
                if isWorking { ProgressView() }
            }
            .alert("Couldn't sign in", isPresented: Binding(
                get: { errorMessage != nil },
                set: { if !$0 { errorMessage = nil } }
            )) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(errorMessage ?? "")
            }
            .onReceive(NotificationCenter.default.publisher(for: .albucSignInURL)) { note in
                guard let url = note.object as? URL else { return }
                link = url.absoluteString
                sent = true
                Task { await verify(link) }
            }
        }
    }

    private func submit() async {
        if sent {
            await verify(link)
        } else {
            await send()
        }
    }

    private func send() async {
        isWorking = true
        defer { isWorking = false }
        do {
            try await model.client().sendMagicLink(email: email.trimmingCharacters(in: .whitespacesAndNewlines))
            sent = true
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func verify(_ raw: String) async {
        guard let parsed = SignInLink.parse(raw) else {
            errorMessage = "That doesn't look like an Albuc sign-in link."
            return
        }
        isWorking = true
        defer { isWorking = false }
        do {
            let session = try await model.client().verify(tokenHash: parsed.tokenHash, type: parsed.type)
            model.apply(session)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
