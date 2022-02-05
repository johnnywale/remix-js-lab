import {useState} from 'react';
import {Button, FloatingLabel, Form} from 'react-bootstrap';
import {ActionFunction, LoaderFunction, redirect, useLoaderData} from 'remix';

import {getCategories, updateBookCategory} from '~/api/bookCategory';
import {getSession} from '~/sessions';
import {BookCategory} from '~/types/bookCategory';

export const loader: LoaderFunction = async ({request, params}) => {
    const {bookGroupId, categoryId} = params;
    if (!bookGroupId) {
        throw new Response('Id missing', {
            status: 404,
        });
    }
    const session = await getSession(request.headers.get('Cookie'));

    if (!session.has('token')) {
        return redirect('/login');
    }

    const token = session.data.token;

    const data: BookCategory[] = await getCategories({bookGroupId, token});

    const category = data.find(({id}) => id === parseInt(categoryId));
    if (!category) {
        throw new Response('Not found', {
            status: 404,
        });
    }
    return category;
};

export const action: ActionFunction = async ({request, params}) => {
    const session = await getSession(request.headers.get('Cookie'));
    if (!session.has('token')) {
        return redirect('/login');
    }
    const {bookGroupId, categoryId} = params;
    if (!bookGroupId || !categoryId) {
        throw new Response('Id missing', {
            status: 404,
        });
    }
    const token = session.data.token;

    const form = await request.formData();

    const name = form.get('name') as string;
    const isActive = form.get('isActive');
    const wasPicked = form.get('wasPicked');

    try {
        await updateBookCategory({
            bookGroupId,
            token,
            body: {name, isActive: Boolean(isActive), wasPicked: Boolean(wasPicked)},
            bookCategoryId: categoryId,
        });
        return redirect(`/book-group/${bookGroupId}/categories`);
    } catch (err) {
        throw new Response(err?.message || 'Unknown error', {
            status: 500,
        });
    }
};

export default function Categories() {
    const {
        name,
        isActive: defaultIsActive,
        wasPicked: defaultWasPicked,
    } = useLoaderData<BookCategory>();
    const [isActive, setIsActive] = useState(defaultIsActive);
    const [wasPicked, setWasPicked] = useState(defaultWasPicked);
    // const message = useActionData<string | undefined>();

    return (
        <>
            <h4>Editing a category</h4>
            <Form method="POST">
                <FloatingLabel className="mb-3" controlId="name" label="name">
                    <Form.Control
                        type="text"
                        name="name"
                        defaultValue={name}
                        placeholder="Sample name"
                    />
                </FloatingLabel>
                <Form.Group className="mb-3" controlId="isActive">
                    <Form.Check
                        type="checkbox"
                        name="isActive"
                        defaultChecked={wasPicked}
                        label="Currently selected"
                        disabled={!wasPicked}
                        checked={wasPicked && isActive}
                        onChange={() => setIsActive(prevIsActive => !prevIsActive)}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="wasPicked">
                    <Form.Check
                        type="checkbox"
                        name="wasPicked"
                        label="picked"
                     //   defaultChecked={wasPicked}
                        checked={wasPicked}
                        onChange={() =>
                            setWasPicked(prevWasPicked => {
                                !prevWasPicked && setIsActive(false);
                                return !prevWasPicked;
                            })
                        }
                    />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Form>
        </>
    );
}
