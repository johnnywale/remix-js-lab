import { Alert, Button, Card, FloatingLabel, Form } from 'react-bootstrap';
import { ActionFunction, useActionData } from 'remix';

import { addUserToGroup } from '~/api/bookGroup';
import { getSession } from '~/sessions';
import { BookGroup } from '~/types/bookGroup';

export const action: ActionFunction = async ({ request, params }) => {
  const { bookGroupId } = params;
  if (!bookGroupId) {
    throw new Response('Id missing', {
      status: 404,
    });
  }
  const body = await request.formData();
  const email = body.get('email');

  const session = await getSession(request.headers.get('Cookie'));

  const token = session.data.token;

  try {
    const data: BookGroup = await addUserToGroup({ body: { email }, token, id: bookGroupId });
    return {
      variant: 'success',
      message: `Successfully added user with e-mail ${email} to group ${data.name}.`,
    };
  } catch (err) {
    return {
      message: err?.message || 'Unexpected server error. Please try again later',
      variant: 'danger',
    };
  }
};

export default function BookGroupForm() {
  const alert = useActionData<{ message: string; variant: string } | undefined>();
  return (
    <Card>
      <Card.Header>
        <h3>Add a user to a group</h3>
      </Card.Header>
      <Card.Body as={Form} method="POST">
        <FloatingLabel className="mb-3" controlId="email" label="User email">
          <Form.Control required type="text" name="email" placeholder="example@gmail.com" />
        </FloatingLabel>
        {alert && <Alert variant={alert.variant}>{alert.message}</Alert>}
        <Button type="submit">Add</Button>
      </Card.Body>
    </Card>
  );
}
