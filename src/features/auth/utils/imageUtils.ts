export const getHighResPhotoURL = (photoURL?: string | null): string => {
    if (photoURL && photoURL.includes("googleusercontent.com")) {
        return photoURL.replace(/=s\d+-c/, "=s512-c");
    }
    if (photoURL && photoURL.includes("facebook.com")) {
        return photoURL.replace(/&type=normal/, "&type=large");
    }
    return photoURL || "/user.png";
};