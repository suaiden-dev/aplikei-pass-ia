import { DS160Schema } from "./src/schemas/ds160.schema";
import { zodValidate } from "./src/utils/zodValidate";

const validator = zodValidate(DS160Schema);
const errors = validator({});
console.log("Errors for empty object:", JSON.stringify(errors, null, 2));

const errors2 = validator({ interviewLocation: "Brasilia" });
console.log("Errors for partial object:", JSON.stringify(errors2, null, 2));
