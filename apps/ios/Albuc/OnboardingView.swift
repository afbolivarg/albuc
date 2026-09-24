import SwiftUI

struct OnboardingView: View {
    @Environment(AppModel.self) private var model
    @State private var firstName = ""
    @State private var lastName = ""
    @State private var handle = ""
    @State private var step = 0
    @State private var isWorking = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            Form {
                if step == 0 {
                    Section {
                        TextField("First name", text: $firstName)
                        TextField("Last name", text: $lastName)
                    } header: {
                        Text("What should we call you?")
                    } footer: {
                        Text("Just your name, so the library feels like yours.")
                    }
                } else {
                    Section {
                        TextField("Username", text: $handle)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                    } header: {
                        Text("Choose a username")
                    } footer: {
                        Text("albuc.com/@\(normalizedHandle.isEmpty ? "you" : normalizedHandle)")
                    }
                }
            }
            .navigationTitle(step == 0 ? "Welcome" : "Username")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    if step == 1 {
                        Button("Back") { step = 0 }
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button(step == 0 ? "Continue" : "Start") {
                        Task { await advance() }
                    }
                    .disabled(isWorking || !canAdvance)
                }
            }
            .alert("Check that", isPresented: Binding(
                get: { errorMessage != nil },
                set: { if !$0 { errorMessage = nil } }
            )) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(errorMessage ?? "")
            }
        }
        .onAppear {
            firstName = model.profile?.firstName ?? ""
            lastName = model.profile?.lastName ?? ""
            handle = model.profile?.handle ?? ""
        }
    }

    private var normalizedHandle: String {
        handle.trimmingCharacters(in: .whitespacesAndNewlines).lowercased().trimmingCharacters(in: CharacterSet(charactersIn: "@"))
    }

    private var canAdvance: Bool {
        if step == 0 {
            return !firstName.trimmingCharacters(in: .whitespaces).isEmpty
                && !lastName.trimmingCharacters(in: .whitespaces).isEmpty
        }
        return normalizedHandle.count >= 3
    }

    private func advance() async {
        isWorking = true
        defer { isWorking = false }
        do {
            if step == 0 {
                let profile = try await model.client().updateProfile([
                    "firstName": firstName.trimmingCharacters(in: .whitespaces),
                    "lastName": lastName.trimmingCharacters(in: .whitespaces),
                ])
                model.replaceProfile(profile)
                step = 1
            } else {
                let profile = try await model.client().updateProfile([
                    "handle": normalizedHandle,
                    "completeOnboarding": true,
                ])
                model.replaceProfile(profile)
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
