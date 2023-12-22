// Observer
export class Observer {
}

// Subject
export class Subject {
  constructor() {
    this.observers = []
  }

  addObserver(observer) {
    this.observers.push(observer)
  }

  removeObserver(observer) {
    this.observers = this.observers.filter((obs) => obs !== observer)
  }

  notify(data) {
    this.observers.forEach((observer) => {
      observer.update(data)
    })
  }
}

export const state = {}

//   // Example usage
//   const subject = new Subject();

//   const observer1 = new Observer();
//   const observer2 = new Observer();

//   subject.addObserver(observer1);
//   subject.addObserver(observer2);

//   // Notify observers
//   subject.notify('Hello, observers!');

//   // Remove an observer
//   subject.removeObserver(observer1);

//   // Notify remaining observer
//   subject.notify('Only one observer now.');
