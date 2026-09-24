import SwiftUI

struct SettingsView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss

    @State private var firstName = ""
    @State private var lastName = ""
    @State private var handle = ""
    @State private var publicProfile = false
    @State private var locale = "en"
    @State private var isSaving = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            Form {
                Section("Name") {
                    TextField("First name", text: $firstName)
                    TextField("Last name", text: $lastName)
                }
                Section {
                    TextField("Username", text: $handle)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                    Toggle("Show my shelf publicly", isOn: $publicProfile)
                } header: {
                    Text("Profile")
                } footer: {
                    Text("albuc.com/@\(handle.isEmpty ? "you" : handle)")
                }
                Section("Language") {
                    Picker("Language", selection: $locale) {
                        Text("English").tag("en")
                        Text("Español").tag("es")
                    }
                }
                Section {
                    Button("Sign Out", role: .destructive) {
                        model.signOut()
                        dismiss()
                    }
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { Task { await save() } }
                        .disabled(isSaving)
                }
            }
            .alert("Settings", isPresented: Binding(
                get: { errorMessage != nil },
                set: { if !$0 { errorMessage = nil } }
            )) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(errorMessage ?? "")
            }
            .onAppear {
                firstName = model.profile?.firstName ?? ""
                lastName = model.profile?.lastName ?? ""
                handle = model.profile?.handle ?? ""
                publicProfile = model.profile?.publicProfile ?? false
                locale = model.profile?.locale ?? "en"
            }
        }
    }

    private func save() async {
        isSaving = true
        defer { isSaving = false }
        do {
            let profile = try await model.client().updateProfile([
                "firstName": firstName.trimmingCharacters(in: .whitespaces),
                "lastName": lastName.trimmingCharacters(in: .whitespaces),
                "handle": handle.trimmingCharacters(in: .whitespacesAndNewlines),
                "publicProfile": publicProfile,
                "locale": locale,
            ])
            model.replaceProfile(profile)
            dismiss()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
