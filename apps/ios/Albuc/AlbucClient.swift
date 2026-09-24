import Foundation

enum AlbucAPIError: LocalizedError {
    case message(String)
    case unauthorized

    var errorDescription: String? {
        switch self {
        case .message(let message): message
        case .unauthorized: "Sign in again."
        }
    }
}

struct AlbucClient {
    var baseURL: URL
    var accessToken: String?
    var refresh: (() async throws -> String)?

    func sendMagicLink(email: String) async throws {
        let _: EmptyResponse = try await request(
            "POST",
            path: "/api/v1/auth/magic-link",
            body: ["email": email],
            authorized: false
        )
    }

    func verify(tokenHash: String, type: String) async throws -> SessionTokens {
        try await request(
            "POST",
            path: "/api/v1/auth/verify",
            body: ["tokenHash": tokenHash, "type": type],
            authorized: false
        )
    }

    func refreshSession(refreshToken: String) async throws -> SessionTokens {
        try await request(
            "POST",
            path: "/api/v1/auth/refresh",
            body: ["refreshToken": refreshToken],
            authorized: false
        )
    }

    func profile() async throws -> Profile {
        try await request("GET", path: "/api/v1/me")
    }

    func updateProfile(_ body: [String: Any]) async throws -> Profile {
        try await request("PATCH", path: "/api/v1/me", body: body)
    }

    func books(status: BookStatus?, query: String) async throws -> [LibraryBook] {
        var items: [URLQueryItem] = []
        if let status { items.append(URLQueryItem(name: "status", value: status.rawValue)) }
        if !query.isEmpty { items.append(URLQueryItem(name: "q", value: query)) }
        let response: BookList = try await request("GET", path: "/api/v1/books", query: items)
        return response.books
    }

    func book(id: String) async throws -> LibraryBook {
        try await request("GET", path: "/api/v1/books/\(id)")
    }

    func addBook(_ hit: SearchHit, status: BookStatus) async throws -> LibraryBook {
        var body: [String: Any] = [
            "workKey": hit.workKey,
            "title": hit.title,
            "authors": hit.authors,
            "authorKeys": hit.authorKeys,
            "status": status.rawValue,
        ]
        if let editionKey = hit.editionKey { body["editionKey"] = editionKey }
        if let publishYear = hit.publishYear { body["publishYear"] = publishYear }
        if let coverId = hit.coverId { body["coverId"] = coverId }
        if let isbn10 = hit.isbn10 { body["isbn10"] = isbn10 }
        if let isbn13 = hit.isbn13 { body["isbn13"] = isbn13 }
        return try await request("POST", path: "/api/v1/books", body: body)
    }

    func updateBook(id: String, patch: [String: Any]) async throws -> LibraryBook {
        try await request("PATCH", path: "/api/v1/books/\(id)", body: patch)
    }

    func deleteBook(id: String) async throws {
        let _: EmptyResponse = try await request("DELETE", path: "/api/v1/books/\(id)")
    }

    func search(query: String) async throws -> [SearchHit] {
        let response: SearchResponse = try await request(
            "GET",
            path: "/api/v1/search",
            query: [URLQueryItem(name: "q", value: query)]
        )
        return response.results
    }

    func ask(question: String, history: [AskTurn]) async throws -> AskAnswer {
        try await request(
            "POST",
            path: "/api/v1/ask",
            body: [
                "question": question,
                "history": history.map { ["role": $0.role, "content": $0.content] },
            ]
        )
    }

    private struct EmptyResponse: Decodable {}
    private struct BookList: Decodable { var books: [LibraryBook] }
    private struct SearchResponse: Decodable { var results: [SearchHit] }

    private func request<T: Decodable>(
        _ method: String,
        path: String,
        query: [URLQueryItem] = [],
        body: [String: Any]? = nil,
        authorized: Bool = true,
        didRefresh: Bool = false
    ) async throws -> T {
        guard let url = Self.url(base: baseURL, path: path, query: query) else {
            throw AlbucAPIError.message("Invalid address.")
        }

        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = method
        urlRequest.setValue("application/json", forHTTPHeaderField: "Accept")
        if let body {
            urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
            urlRequest.httpBody = try JSONSerialization.data(withJSONObject: body)
        }
        if authorized, let accessToken {
            urlRequest.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }

        let (data, response) = try await URLSession.shared.data(for: urlRequest)
        guard let http = response as? HTTPURLResponse else {
            throw AlbucAPIError.message("No response.")
        }

        if http.statusCode == 401, authorized, !didRefresh, let refresh {
            let token = try await refresh()
            var retried = self
            retried.accessToken = token
            return try await retried.request(
                method,
                path: path,
                query: query,
                body: body,
                authorized: authorized,
                didRefresh: true
            )
        }

        if http.statusCode == 401 { throw AlbucAPIError.unauthorized }
        if !(200..<300).contains(http.statusCode) {
            if let payload = try? JSONDecoder().decode(APIErrorBody.self, from: data) {
                throw AlbucAPIError.message(payload.message)
            }
            throw AlbucAPIError.message("Something went wrong.")
        }
        if T.self == EmptyResponse.self, let empty = EmptyResponse() as? T {
            return empty
        }
        return try JSONDecoder().decode(T.self, from: data)
    }

    private static func url(base: URL, path: String, query: [URLQueryItem]) -> URL? {
        var components = URLComponents(url: base, resolvingAgainstBaseURL: false)
        let prefix = components?.path ?? ""
        let suffix = path.hasPrefix("/") ? path : "/\(path)"
        components?.path = prefix + suffix
        if !query.isEmpty { components?.queryItems = query }
        return components?.url
    }
}
