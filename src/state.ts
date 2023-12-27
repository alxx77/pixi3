import { SlotMachine } from "./slotMachine"
import { Layout } from "./components/layout"
import { User, Response } from "./server"

// Observer class
//used for inter-component communication
export class Observer {
  public update(data: String) {}
}

// Subject
export class Subject {
  observers: Observer[]
  constructor() {
    this.observers = []
  }

  addObserver(observer: Observer) {
    this.observers.push(observer)
  }

  removeObserver(observer: Observer) {
    this.observers = this.observers.filter((obs) => obs !== observer)
  }

  notify(data: String) {
    this.observers.forEach((observer) => {
      observer.update(data)
    })
  }
}

//state type
export type State = {
  initialStripes: string[][]
  isPlayingRound: boolean
  layout: Layout
  slotMachine: SlotMachine
  user:User
  response:Response
}

//state
export const state = {} as State


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
