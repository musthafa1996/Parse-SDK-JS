jest.dontMock('../ParseHooks');
jest.dontMock('../CoreManager');
jest.dontMock('../decode');
jest.dontMock('../encode');
jest.dontMock('../ParseError');
jest.dontMock('../ParseObject');

const Hooks = require('../ParseHooks');
const CoreManager = require('../CoreManager');

const defaultController = CoreManager.getHooksController();
const { sendRequest } = defaultController;

describe('Hooks', () => {
  beforeEach(() => {
    const run = jest.fn();
    run.mockReturnValue(
      Promise.resolve({
        result: {},
      })
    );
    defaultController.sendRequest = run;
    CoreManager.setHooksController(defaultController);
  });

  it('shoud properly build GET functions', () => {
    Hooks.getFunctions();

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0]).toEqual([
      'GET',
      '/hooks/functions',
    ]);
  });

  it('shoud properly build GET triggers', () => {
    Hooks.getTriggers();

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0]).toEqual([
      'GET',
      '/hooks/triggers',
    ]);
  });

  it('shoud properly build GET function', () => {
    Hooks.getFunction('functionName');

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0]).toEqual([
      'GET',
      '/hooks/functions/functionName',
    ]);
  });

  it('shoud properly build GET trigger', () => {
    Hooks.getTrigger('MyClass', 'beforeSave');

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0]).toEqual([
      'GET',
      '/hooks/triggers/MyClass/beforeSave',
    ]);
  });

  it('shoud properly build POST function', () => {
    Hooks.createFunction('myFunction', 'https://dummy.com');

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0]).toEqual([
      'POST',
      '/hooks/functions',
      {
        functionName: 'myFunction',
        url: 'https://dummy.com',
      },
    ]);
  });

  it('shoud properly build POST trigger', () => {
    Hooks.createTrigger('MyClass', 'beforeSave', 'https://dummy.com');

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0]).toEqual([
      'POST',
      '/hooks/triggers',
      {
        className: 'MyClass',
        triggerName: 'beforeSave',
        url: 'https://dummy.com',
      },
    ]);
  });

  it('shoud properly build PUT function', () => {
    Hooks.updateFunction('myFunction', 'https://dummy.com');

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0]).toEqual([
      'PUT',
      '/hooks/functions/myFunction',
      {
        url: 'https://dummy.com',
      },
    ]);
  });

  it('shoud properly build PUT trigger', () => {
    Hooks.updateTrigger('MyClass', 'beforeSave', 'https://dummy.com');

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0]).toEqual([
      'PUT',
      '/hooks/triggers/MyClass/beforeSave',
      {
        url: 'https://dummy.com',
      },
    ]);
  });

  it('shoud properly build removeFunction', () => {
    Hooks.removeFunction('myFunction');

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0]).toEqual([
      'PUT',
      '/hooks/functions/myFunction',
      { __op: 'Delete' },
    ]);
  });

  it('shoud properly build removeTrigger', () => {
    Hooks.removeTrigger('MyClass', 'beforeSave');

    expect(CoreManager.getHooksController().sendRequest.mock.calls[0]).toEqual([
      'PUT',
      '/hooks/triggers/MyClass/beforeSave',
      { __op: 'Delete' },
    ]);
  });

  it('shoud throw invalid create', async () => {
    expect.assertions(10);
    const p1 = Hooks.create({ functionName: 'myFunction' }).catch(err => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });

    const p2 = Hooks.create({ url: 'http://dummy.com' }).catch(err => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });

    const p3 = Hooks.create({ className: 'MyClass' }).catch(err => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });

    const p4 = Hooks.create({ className: 'MyClass', url: 'http://dummy.com' }).catch(err => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });

    const p5 = Hooks.create({ className: 'MyClass', triggerName: 'beforeSave' }).catch(err => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });

    await Promise.all([p1, p2, p3, p4, p5]);
  });

  it('shoud throw invalid update', async () => {
    expect.assertions(6);
    const p1 = Hooks.update({ functionssName: 'myFunction' }).catch(err => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });

    const p2 = Hooks.update({ className: 'MyClass' }).catch(err => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });

    const p3 = Hooks.update({ className: 'MyClass', url: 'http://dummy.com' }).catch(err => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });
    await Promise.all([p1, p2, p3]);
  });

  it('shoud throw invalid remove', async () => {
    expect.assertions(6);
    const p1 = Hooks.remove({ functionssName: 'myFunction' }).catch(err => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });

    const p2 = Hooks.remove({ className: 'MyClass' }).catch(err => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });

    const p3 = Hooks.remove({ className: 'MyClass', url: 'http://dummy.com' }).catch(err => {
      expect(err.code).toBe(143);
      expect(err.error).toBe('invalid hook declaration');
    });

    await Promise.all([p1, p2, p3]);
  });

  it('should sendRequest', async () => {
    defaultController.sendRequest = sendRequest;
    const request = function () {
      return Promise.resolve(12);
    };
    CoreManager.setRESTController({ request, ajax: jest.fn() });
    const decoded = await defaultController.sendRequest('POST', 'hooks/triggers/myhook');
    expect(decoded).toBe(12);
  });

  it('handle sendRequest error', async () => {
    defaultController.sendRequest = sendRequest;
    const request = function () {
      return Promise.resolve(undefined);
    };
    CoreManager.setRESTController({ request, ajax: jest.fn() });
    try {
      await defaultController.sendRequest('POST', 'hooks/triggers/myhook');
      expect(false).toBe(true);
    } catch (e) {
      expect(e.message).toBe('The server returned an invalid response.');
    }
  });
});
