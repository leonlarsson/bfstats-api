import json from "./json";

export default (error: Error) => {
    console.error({ message: error.message });
    return json({ message: error.message }, 500);
};