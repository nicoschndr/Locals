const firebaseMock = jest.genMockFromModule("firebase/app");

firebaseMock.initializeApp = jest.fn();
firebaseMock.auth = jest.fn(() => {
	return {
		signInWithEmailAndPassword: jest.fn(),
		signOut: jest.fn(),
	};
});
firebaseMock.firestore = jest.fn(() => {
	return {
		collection: jest.fn(() => {
			return {
				doc: jest.fn(() => {
					return {
						get: jest.fn(),
						set: jest.fn(),
						update: jest.fn(),
						delete: jest.fn(),
					};
				}),
			};
		}),
	};
});
firebaseMock.storage = jest.fn(() => {
	return {
		ref: jest.fn(() => {
			return {
				put: jest.fn(),
				getDownloadURL: jest.fn(),
			};
		}),
	};
});

export default firebaseMock;
