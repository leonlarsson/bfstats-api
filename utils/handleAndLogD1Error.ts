import json from "./json";

export default (error: any) => {
    console.error({ message: error.message, cause: error.cause?.message });
    return json({ message: error.message, cause: error.cause?.message }, 500);
};