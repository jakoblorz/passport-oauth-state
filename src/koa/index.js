// @flow
import util from 'util';
import Store from '../';
import { type Context } from 'koa';

function removeHours(d: Date, x: number): Date {
  d.setHours(d.getHours() - x);
  return d;
}

function addHours(d: Date, x: number): Date {
  d.setHours(d.getHours() + x);
  return d;
}

function addStateOnKey(key: string) {
  return function(ctx: Context, state: string) {
    ctx.cookies.set(key, state, {
      httpOnly: false,
      expires: addHours(new Date(), 1),
    });
  };
}

function removeStateOnKey(key: string) {
  return function(ctx: Context) {
    ctx.cookies.set(key, '', {
      httpOnly: false,
      expires: removeHours(new Date(), 1),
    });
  };
}

function verifyStateOnKey(key: string) {
  return function(ctx: Context, providedState: string) {
    const state = ctx.cookies.get(key);
    if (!state) {
      return false;
    }

    return state === providedState;
  };
}

function KoaCookiesStore(options: { key?: string } = { key: 'state' }) {
  this.key = options.key || 'state';
  Store.call(
    this,
    addStateOnKey(this.key),
    removeStateOnKey(this.key),
    verifyStateOnKey(this.key)
  );
}

util.inherits(KoaCookiesStore, Store);

export default KoaCookiesStore;
