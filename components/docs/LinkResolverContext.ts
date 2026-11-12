"use client";

import { createContext } from "react";

// Maps a relative link found in markdown to an in-app href, or null when the target is not
// part of the current book. Without a provider, relative links are left untouched.
export type LinkResolver = (href: string) => string | null;

export const LinkResolverContext = createContext<LinkResolver | null>(null);
