const { gql } = require("apollo-server");
const createTestServer = require("./helper");
const models = require("../models")

const USER = gql `
    {
        allusers {
            firstName,
            lastName
            id
        }
    }
`

describe('queries', () => {
    test('allusers', async () => {
        const {query} = createTestServer({
            "allusers": jest.fn(models.User.findAll())            
        })
        // https://github.com/erwin261996/testgraphql.git

        // const res = await query({ query: USER, http: { headers: { authorization: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidGVzdDJAZ21haWwuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNjQwMjk1MzY3LCJleHAiOjE2NDAzMDI1Njd9.5yXc6aDKnAP6W8glTuCqwSU0Uq_0A7roPRMMnIRpEMc` } },})
        const res = await query({ query: USER })
        expect(res).toMatchSnapshot()
    })
})