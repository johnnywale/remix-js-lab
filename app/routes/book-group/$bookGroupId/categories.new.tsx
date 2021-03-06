import { Alert, Button, Card, FloatingLabel, Form } from 'react-bootstrap';
import { ActionFunction, redirect, useActionData } from 'remix';

import { createBookCategory } from '~/api/bookCategory';
import { getSession } from '~/sessions';

export const action: ActionFunction = async ({ request, params }) => {
  const { bookGroupId } = params;
  if (!bookGroupId) {
    throw new Response('Id missing', {
      status: 404,
    });
  }
  const body = await request.formData();
  const name = body.get('name');

  const session = await getSession(request.headers.get('Cookie'));

  const token = session.data.token;
  try {
    await createBookCategory({ body: { name }, bookGroupId, token });
    return redirect(`/book-group/${bookGroupId}/categories`);
  } catch (err) {
    return err?.message || 'Unknown error';
  }
};

export default function BookGroupForm() {
  const message = useActionData<string | undefined>();
  return (
    <Card>
      <Card.Header>
        <h3>Nowa kategoria</h3>
      </Card.Header>
      <Card.Body as={Form} method="POST">
        <FloatingLabel className="mb-3" controlId="name" label="Category name">
          <Form.Control type="text" name="name" placeholder="Sample name" />
        </FloatingLabel>
        {message && <Alert variant="danger">{message}</Alert>}
        <Button type="submit">Submit</Button>
      </Card.Body>
    </Card>
  );
}
