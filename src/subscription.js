function newTaskSubscribe(parent, args, context) {
    return context.pubsub.asyncIterator("NEW_TASK")
}

const newTask = {
    subscribe: newTaskSubscribe,
    resolve: payload => {
        return payload
    } 
}

module.exports = {
    newTask,
}