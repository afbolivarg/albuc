import Foundation
import Observation

@MainActor
@Observable
final class AppModel {
    private static let account = "session"

    var profile: Profile?
    var isRestoring = true
    private var tokens: SessionTokens?

    var isSignedIn: Bool { tokens != nil }

    init() {
        restore()
    }

    func restore() {
        defer { isRestoring = false }
        guard let data = try? Keychain.load(account: Self.account),
              let stored = try? JSONDecoder().decode(SessionTokens.self, from: data) else {
            return
        }
        tokens = stored
        profile = stored.profile
    }

    func client() -> AlbucClient {
        AlbucClient(
            baseURL: AlbucConfig.apiBaseURL,
            accessToken: tokens?.accessToken,
            refresh: { [weak self] in
                guard let self else { throw AlbucAPIError.unauthorized }
                return try await self.refreshAccessToken()
            }
        )
    }

    func apply(_ session: SessionTokens) {
        tokens = session
        profile = session.profile
        if let data = try? JSONEncoder().encode(session) {
            try? Keychain.save(data, account: Self.account)
        }
    }

    func signOut() {
        tokens = nil
        profile = nil
        Keychain.delete(account: Self.account)
    }

    func replaceProfile(_ profile: Profile) {
        self.profile = profile
        tokens?.profile = profile
        persist()
    }

    func refreshProfile() async {
        guard tokens != nil else { return }
        if let profile = try? await client().profile() {
            replaceProfile(profile)
        }
    }

    private func persist() {
        guard let tokens, let data = try? JSONEncoder().encode(tokens) else { return }
        try? Keychain.save(data, account: Self.account)
    }

    private func refreshAccessToken() async throws -> String {
        guard let refreshToken = tokens?.refreshToken else {
            throw AlbucAPIError.unauthorized
        }
        let session = try await AlbucClient(baseURL: AlbucConfig.apiBaseURL, accessToken: nil, refresh: nil)
            .refreshSession(refreshToken: refreshToken)
        apply(session)
        return session.accessToken
    }
}

enum SignInLink {
    static func parse(_ raw: String) -> (tokenHash: String, type: String)? {
        let trimmed = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        guard let components = URLComponents(string: trimmed) else { return nil }
        let items = components.queryItems ?? []
        guard let tokenHash = items.first(where: { $0.name == "token_hash" })?.value, !tokenHash.isEmpty else {
            return nil
        }
        let type = items.first(where: { $0.name == "type" })?.value ?? "email"
        return (tokenHash, type)
    }
}
