export const timestamp = (schema) => {
  schema.add({
    createdAt: Date,
    updatedAt: Date
  })

  schema.pre('save', function (next) {
    let now = Date.now()

    this.updatedAt = now
    if (!this.createdAt) {
      this.createdAt = now
    }
    next()
  })
}

export const location = (schema) => {
  schema.add({
    location: {
      street: String,
      complement: String,
      city: String,
      state: String,
      zipcode: { type: String },
      geo: {
        lat: { type: Number },
        lng: { type: Number }
      }
    }
  })
}