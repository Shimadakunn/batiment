import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Password],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      if (args.existingUserId) {
        return args.existingUserId;
      }

      // Create new user with required fields
      return await ctx.db.insert("users", {
        email: args.profile.email as string,
        name: args.profile.name,
        image: args.profile.image,
        emailVerified: args.profile.emailVerificationTime,
        role: "member", // Default role for new users
        createdAt: Date.now(),
      });
    },
  },
});
