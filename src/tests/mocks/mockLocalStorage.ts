class LocalStorageMock {
  private store: {
    [key: string]: any;
  } = {}
  constructor() {
    this.store = {};
  }

  public clear() {
    this.store = {};
  }

  public getItem(key: string) {
    return this.store[key] || null;
  }

  public setItem(key: string, value: any) {
    this.store[key] = value.toString();
  }

  public removeItem(key: string) {
    delete this.store[key];
  }
};

window.localStorage = new LocalStorageMock();