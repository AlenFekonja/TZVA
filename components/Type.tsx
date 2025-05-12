export type Pin = {
    id: string;
    title: string;
    description: string;
    category: string;
    street: string;
    userId: string;
    city: string;
    longitude?: string;
    latitude?: string;
    review: string;
    createdAt: Date;
    image?: string;
};

export type User = {
    id: string;
    email: string;
    username: string;
    admin: Boolean;
    onBoarding: Boolean;
    createdAt: Date;
};