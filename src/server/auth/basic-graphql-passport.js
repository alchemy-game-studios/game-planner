//import { graphql, buildSchema } from "graphql";

function BasicGraphQLPassportCb(email, password, done) {
    const string = email + password;
    console.log(string);
    done();
}

export default BasicGraphQLPassportCb;