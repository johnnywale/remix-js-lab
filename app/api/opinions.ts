import {Opinion} from '~/types/opinion';
import {WithToken} from '~/types/requests';

import {client} from './client';

const url = 'bookGroup';

type GetOpinion = {
    bookId: string | number;
} & WithToken;

export type SendOpinion = {
    body: Omit<Opinion, 'id'>;
} & GetOpinion;

export const createOpinion = ({token, body, bookGroupId}: SendOpinion): Promise<Opinion> => {
    return client(`${url}/${bookGroupId}/opinion`, {token, body});
};

export const getOpinions = ({token, bookId}: GetOpinion): Promise<Opinion[]> => {
    let req_url = `${url}/opinion/${bookId}`
    console.log("will request %s", req_url)
    return client(req_url, {token});
};
