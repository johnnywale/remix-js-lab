import { useState } from 'react';
import { Alert, Button, Form, Row } from 'react-bootstrap';
import {
  ActionFunction,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
  useParams,
} from 'remix';

import { getCategories, updateBookCategory } from '~/api/bookCategory';
import { getSession } from '~/sessions';
import { BookCategory } from '~/types/bookCategory';

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

  const token = session.data.token;

  const data: BookCategory[] = await getCategories({ bookGroupId, token });
  return data.filter(({ wasPicked, isActive }) => !wasPicked || isActive);
};

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get('Cookie'));
  if (!session.has('token')) {
    return redirect('/login');
  }
  const { bookGroupId } = params;
  if (!bookGroupId) {
    throw new Response('Id missing', {
      status: 404,
    });
  }
  const token = session.data.token;

  const form = await request.formData();

  const categoryId = form.get('categoryId') as string;

  const data = await updateBookCategory({
    bookGroupId,
    token,
    bookCategoryId: categoryId,
    body: { isActive: true, wasPicked: true },
  });

  return data;
};

export default function Index() {
  const actionData = useActionData<BookCategory>();
  const { bookGroupId } = useParams();

  const bookCategories = useLoaderData<BookCategory[]>();
  const [index, setIndex] = useState(() => actionData?.id || -1);
  const activeCategory = bookCategories.find(({ isActive }) => isActive);

  const getRandom = () => {
    const randomIndex = Math.floor(Math.random() * bookCategories.length);
    setIndex(randomIndex);
  };

  return (
    <Row>
      {!actionData && activeCategory && (
        <Alert variant="info">
          {`There is an active category ${activeCategory?.name}. Finish discussing it before drawing another one!`}
        </Alert>
      )}
      {actionData && <Alert variant="success">{`Drawn: ${actionData?.name}`}</Alert>}
      {!bookCategories.length && (
        <Alert variant="info">No categories to draw. Add new categories..</Alert>
      )}
      <Form method="POST" action={`/book-group/${bookGroupId}/?index`}>
        <Form.Control type="hidden" name="categoryId" value={bookCategories?.[index]?.id} />
        <Button
          onClick={getRandom}
          type="submit"
          disabled={Boolean(activeCategory) || !bookCategories.length}
        >
          Randomly
        </Button>
      </Form>
    </Row>
  );
}
