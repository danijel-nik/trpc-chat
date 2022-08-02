import express from "express";
import * as trpc from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import { z } from "zod";

export interface ChatMessage {
	user: string;
	message: string;
}

const messages: ChatMessage[] = [
	{ user: "user1", message: "Hello" },
	{ user: "user2", message: "Hi" }
];

const appRouter = trpc.router()
	.query("hello", {
		resolve() {
			return "Hello world!!"
		},
	})
	.query("getMessages", {
		input: z.number().default(10), // define the type of the input (if it is undefined, default value is 10)
		resolve({ input }) {
			return messages.slice(-input); // will give last 10 items or how much is defined
		}
	})
	.mutation("addMessage", {
		input: z.object({
			user: z.string(),
			message: z.string()
		}),
		resolve({ input }) {
			messages.push(input);
			return input;
		}
	});

export type AppRouter = typeof appRouter;

const app = express();
app.use(cors());
const port = 5000;

app.use("/trpc", trpcExpress.createExpressMiddleware({
	router: appRouter,
	createContext: () => null
}));

app.get("/", (req, res) => {
	res.send("Hello from api-server");
});

app.listen(port, () => {
	console.log(`api-server listening at http://localhost:${port}`);
});
