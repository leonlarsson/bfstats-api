import D1Error from "../types";
import json from "./json";

export default (error: D1Error) => {
    console.error({ message: error.message, cause: error.cause?.message });
    return json({ message: error.message, cause: error.cause?.message }, 500);
};