import { gql, useQuery } from '@apollo/client';

const QUERY_Hello_World = gql`
    query GetMessage {
        Hello {
            message
        }
    }
`;
export function Message () {
    const {loading, error, data} = useQuery(QUERY_Hello_World);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error :</p>;
    return (
       <p>{data.message}</p>
    );
}