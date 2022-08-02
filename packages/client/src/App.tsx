import React, { useState } from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { trpc } from "./trpc";
import { ChatMessage } from "api-server";

import "./index.scss";

const client = new QueryClient();

const AppContent = () => {
	const [user, setUser] = useState("");
	const [message, setMessage] = useState("");
	// const getMessages = trpc.useQuery(["getMessages", 1]); // get the last message
	const getMessages = trpc.useQuery(["getMessages"]);

	const addMessage = trpc.useMutation("addMessage");
	const onAdd = async () => {
		await addMessage.mutate({
			message,
			user
		}, {
			onSuccess: () => {
				// fire query "getMessages" to get data on success
				client.invalidateQueries(["getMessages"]);
			}
		});
		setMessage("");
	};

	return (
		<div className="mt-10 text-3xl mx-auto max-w-6xl">
			<div>
				{(getMessages.data ?? []).map((row: ChatMessage) => (
					<div key={row.message}>{JSON.stringify(row)}</div>
				))}
			</div>
			<div className="mt-10">
				<input
					type="text"
					value={user}
					onChange={(e) => setUser(e.target.value)}
					className="p-5 border-2 border-gray-300 rounded-lg w-full"
					placeholder="User"
				/>
				<input
					type="text"
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					className="p-5 border-2 border-gray-300 rounded-lg w-full"
					placeholder="Message"
				/>
			</div>
			<button onClick={onAdd}>Add message</button>
		</div>
	)
};

const App = () => {
	const [trpcClient] = useState(() =>
		trpc.createClient({
			url: "http://localhost:5000/trpc"
		})
	);
	return (
		<trpc.Provider client={trpcClient} queryClient={client}>
			<QueryClientProvider client={client}>
				<AppContent />
			</QueryClientProvider>
		</trpc.Provider>
	)
};
ReactDOM.render(<App />, document.getElementById("app"));
