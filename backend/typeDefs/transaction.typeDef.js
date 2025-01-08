const transactionTypeDef = `#graphql
    type Transaction {
        _id: ID!,
        userId: ID!,
        description: String!,
        paymentType: String!,
        category: String!,
        amount: Float!,
        location: String,
        date: String!
    }

    type Query {
        transactions: [Transaction!]
        transaction(transaction: ID!): Transaction
    }

    type Mutation {
        createTranscacion(input: CreateTrancacionInput!): Transaction!
        updateTransaction(input: UpdateTransactionInput!): Transaction!
        deleteTransaction(transactionID: ID!): Transaction!
    }

    type CreateTrancacionInput {
        description: String!,
        paymentType: String!,
        category: String!,
        amount: Float!,
        location: String,
        date: String!
    }

    type UpdateTransactionInput {
        transactionID: ID!
        description: String,
        paymentType: String,
        category: String,
        amount: Float,
        location: String,
        date: String
    }
`;

export default transactionTypeDef;
