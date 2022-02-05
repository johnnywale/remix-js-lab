import { Card, Nav } from 'react-bootstrap';
import { LoaderFunction, Outlet, redirect, useLoaderData } from 'remix';

import { getBookGroups } from '~/api/bookGroup';
import { getSession } from '~/sessions';
import { BookGroup } from '~/types/bookGroup';

export const loader: LoaderFunction = async ({ request, params }) => {
  const { bookGroupId } = params;
  if (!bookGroupId) {
    throw new Response('Id missing', {
      status: 404,
    });
  }
  const session = await getSession(request.headers.get('Cookie'));

  if (!session.has('token')) {
    // Redirect to the home page if they are already signed in.
    return redirect('/login');
  }

  const id = session.data.userId;
  const token = session.data.token;

  const data: BookGroup[] = await getBookGroups({ id, token });
  const bookGroup = data.find(bookGroup => bookGroup.id === parseInt(bookGroupId));

  if (bookGroup && bookGroupId) {
    const { name, creatorId } = bookGroup;
    return { name, bookGroupId, isAdmin: creatorId === id };
  }

  throw new Response('Not Found', {
    status: 404,
  });
};

export default function BookGroupView() {
  const { name, bookGroupId, isAdmin } =
    useLoaderData<{ name: string; bookGroupId: string; isAdmin: boolean }>();
  return (
    <Card>
      <Card.Header>
        <h3>{`Welcome - ${name}`}</h3>
        <Nav defaultActiveKey={`/book-group/${bookGroupId}`}>
          <Nav.Item>
            <Nav.Link href={`/book-group/${bookGroupId}`}>Draw categories</Nav.Link>
          </Nav.Item>
          {isAdmin && (
            <>
              <Nav.Item>
                <Nav.Link href={`/book-group/${bookGroupId}/add-user`}>Add a user</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link href={`/book-group/${bookGroupId}/categories`}>
                  Manage categories
                </Nav.Link>
              </Nav.Item>
            </>
          )}
          <Nav.Item>
            <Nav.Link href={`/book-group/${bookGroupId}/drawn`}>The categories drawn</Nav.Link>
          </Nav.Item>
        </Nav>
      </Card.Header>
      <Card.Body>
        <Outlet />
      </Card.Body>
    </Card>
  );
}
