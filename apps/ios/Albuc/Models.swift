import Foundation

enum AlbucConfig {
    static var apiBaseURL: URL {
        if let override = UserDefaults.standard.string(forKey: "AlbucAPIBaseURL"),
           let url = URL(string: override) {
            return url
        }
        if let raw = Bundle.main.object(forInfoDictionaryKey: "AlbucAPIBaseURL") as? String,
           let url = URL(string: raw) {
            return url
        }
        return URL(string: "https://albuc.com")!
    }
}

enum BookStatus: String, Codable, CaseIterable, Identifiable {
    case want = "WANT"
    case owned = "OWNED"
    case reading = "READING"
    case read = "READ"

    var id: String { rawValue }

    var title: String {
        switch self {
        case .want: "Want"
        case .owned: "Owned"
        case .reading: "Reading"
        case .read: "Read"
        }
    }
}

enum NoteVisibility: String, Codable {
    case `private` = "private"
    case `public` = "public"
}

struct Profile: Codable, Equatable {
    var id: String
    var email: String
    var firstName: String?
    var lastName: String?
    var handle: String?
    var locale: String
    var publicProfile: Bool
    var needsOnboarding: Bool

    var displayName: String {
        let name = [firstName, lastName]
            .compactMap { $0?.trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty }
            .joined(separator: " ")
        return name.isEmpty ? email : name
    }
}

struct LibraryBook: Codable, Identifiable, Equatable {
    var id: String
    var workKey: String
    var editionKey: String?
    var title: String
    var authors: [String]
    var publishYear: Int?
    var coverUrl: String?
    var status: BookStatus
    var rating: Int?
    var noteMarkdown: String?
    var visibility: NoteVisibility
    var shareUrl: String?
    var updatedAt: String

    var authorLine: String {
        let names = authors.filter { !$0.isEmpty }
        return names.isEmpty ? "Unknown Author" : names.joined(separator: ", ")
    }
}

struct SearchHit: Codable, Identifiable, Equatable {
    var workKey: String
    var editionKey: String?
    var title: String
    var authors: [String]
    var authorKeys: [String]
    var publishYear: Int?
    var coverId: Int?
    var isbn10: [String]?
    var isbn13: [String]?

    var id: String { workKey }

    var authorLine: String {
        authors.isEmpty ? "Unknown Author" : authors.joined(separator: ", ")
    }

    var coverURL: URL? {
        guard let coverId else { return nil }
        return URL(string: "https://covers.openlibrary.org/b/id/\(coverId)-M.jpg")
    }
}

struct AskSource: Codable, Identifiable, Equatable {
    var n: Int
    var bookId: String
    var title: String
    var authors: [String]
    var year: Int?
    var coverUrl: String?
    var excerpt: String

    var id: String { "\(n)-\(bookId)" }
}

struct AskAnswer: Codable {
    var answer: String
    var sources: [AskSource]
    var overSoftCap: Bool
}

struct SessionTokens: Codable {
    var accessToken: String
    var refreshToken: String
    var expiresAt: Int?
    var profile: Profile
}

struct APIErrorBody: Codable {
    var error: String
    var message: String
}

struct AskTurn: Codable {
    var role: String
    var content: String
}
