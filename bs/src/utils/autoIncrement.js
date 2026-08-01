import Counter from "../models/counter.model.js";

export const getNextSequence = async (name) => {
    const counter = await Counter.findOneAndUpdate(
        { name },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return counter.seq;
};

export const setSequence = async (name, value) => {
    await Counter.findOneAndUpdate(
        { name },
        { seq: value },
        { upsert: true }
    );
};
