import { Router } from 'express';
import slackCallback from './slackCallback'
import unread from './unread'
import mark from './mark'

export default function() {
	const api = Router();

	api.post('/auth/slack/callback', slackCallback);

	api.get('/unread', unread);

	api.post('/mark', mark);

	return api;
}
