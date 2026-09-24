import SwiftUI

@main
struct AlbucApp: App {
    @State private var model = AppModel()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(model)
                .onOpenURL { url in
                    NotificationCenter.default.post(name: .albucSignInURL, object: url)
                }
        }
    }
}

extension Notification.Name {
    static let albucSignInURL = Notification.Name("albucSignInURL")
}

struct RootView: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        Group {
            if model.isRestoring {
                ProgressView()
            } else if !model.isSignedIn {
                SignInView()
            } else if model.profile?.needsOnboarding == true {
                OnboardingView()
            } else {
                LibraryView()
            }
        }
        .tint(.primary)
    }
}
