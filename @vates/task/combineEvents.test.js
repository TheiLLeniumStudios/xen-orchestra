'use strict'

const { assert, match } = require('@sinonjs/referee')
const { test } = require('test')

const { Task } = require('./index.js')
const { makeOnProgress } = require('./combineEvents.js')

const noop = Function.prototype

test(async function (t) {
  const events = []
  const assertEvent = (event, ...args) => {
    const { i } = assertEvent
    const n = i + 1
    assert.equals(n, events.length)
    assert.equals(events[i][0], event)
    assertEvent.i = n
  }
  assertEvent.i = 0
  const spy = event =>
    function () {
      events.push([event, ...arguments])
    }

  const onProgress = makeOnProgress({
    onRootTaskEnd: spy('end'),
    onRootTaskStart: spy('start'),
    onTaskUpdate: spy('update'),
  })
  const main = {
    name: 'my task',
    result: 'bar',
  }
  const sub1 = {
    name: 'subtask 1',
    result: 'foo',
  }
  const sub2 = {
    name: 'subtask 2',
    result: new Error(),
  }

  await Task.run({ name: main.name, onProgress }, async () => {
    assertEvent('start', { name: 'my task' })

    Task.set('progress', 0)
    // assert.equals(events[1], ['update', task])

    await Task.run({ name: sub1.name }, () => sub1.result)
    await Task.run({ name: sub2.name }, () => {
      throw sub2.result
    }).catch(noop)

    Task.set('progress', 1)

    return main.result
  })
  assert.equals(events[0][1], {
    ...main,

    id: match.string,
    start: match.number,
    tasks: [
      {
        ...sub1,

        id: match.string,
        start: match.number,
        end: match.number,
        status: 'success',
      },
      {
        ...sub2,

        id: match.string,
        start: match.number,
        end: match.number,
        status: 'failure',
      },
    ],
    properties: {
      progress: 1,
    },
    end: match.number,
    status: 'success',
  })
})
