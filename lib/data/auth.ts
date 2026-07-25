import { auth } from "../auth/server";


export async function getSession() {
    try {
        const { data: session } = await auth.getSession();
        if (!session?.user) {
            throw new Error("You must be signed in to perform this action.");
        }
        return session;
    } catch (error) {
        console.error("Error getting session:", error);
        throw new Error("Failed to get session.");
    }
}