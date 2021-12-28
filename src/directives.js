
const { mapSchema, getDirective, MapperKind } = require('@graphql-tools/utils');
const { defaultFieldResolver } = require('graphql');

const UpperDirectiveTransformer = (schema, directiveName) => {
  return mapSchema(schema, {

    // Executes once for each object field in the schema
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {

      // Check whether this field has the specified directive
      const upperDirective = getDirective(schema, fieldConfig, directiveName)?.[0];

      if (upperDirective) {

        // Get this field's original resolver
        const { resolve = defaultFieldResolver } = fieldConfig;

        // Replace the original resolver with a function that *first* calls
        // the original resolver, then converts its result to upper case
        fieldConfig.resolve = async function (source, args, context, info) {
          const result = await resolve(source, args, context, info);
          if (typeof result === 'string') {
            return result.toUpperCase();
          }
          return result;
        }
        return fieldConfig;
      }
    }
  });
}

const AuthenticatedDirective = (schema, directiveName) => {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const authDirective = getDirective(schema, fieldConfig, directiveName)?.[0];

      if (authDirective)
      {
        const { resolve = defaultFieldResolver } = fieldConfig;
        fieldConfig.resolve = async function (root, args, context, info) {
          if (!context.user) {
            throw new Error("not authorized");
          }
          return resolve(root, args, context, info)
        }
      }
    }
  })
}

const AuthorizedDirective = (schema, directiveName) => {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const authDirective = getDirective(schema, fieldConfig, directiveName)?.[0];

      if (authDirective)
      {
        const { resolve = defaultFieldResolver } = fieldConfig;
        fieldConfig.resolve = async function (root, args, context, info) {
          const {role} = args;

          /*console.log('context:: ', context.user
          .then(res => res.json())
          .then(value => {
            console.log('erwinValue: ',value)
          })  )*/

          if (context.user.role !== role) {
            throw new Error(`Must by a ${role} bruth`)
          }
        
          return resolve(root, args, context, info)
        }
      }
    }
  })
}

 // https://github.com/erwin261996/testgraphql.git
 // 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 (28/12/2021 hasta en 7 dias)

module.exports = {
  UpperDirectiveTransformer,
  AuthenticatedDirective,
  AuthorizedDirective
}
