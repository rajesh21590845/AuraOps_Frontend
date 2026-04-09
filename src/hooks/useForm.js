import { useState, useCallback } from 'react'

/**
 * Lightweight form state hook with validation support.
 */
export function useForm(initialValues, validators = {}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const handleChange = useCallback((field) => (e) => {
    const value = e?.target !== undefined ? e.target.value : e
    setValues(v => ({ ...v, [field]: value }))
    // Clear error on change
    if (errors[field]) {
      setErrors(err => ({ ...err, [field]: null }))
    }
  }, [errors])

  const validate = useCallback((data) => {
    const newErrors = {}
    for (const [field, fn] of Object.entries(validators)) {
      const msg = fn(data[field], data)
      if (msg) newErrors[field] = msg
    }
    return newErrors
  }, [validators])

  const handleSubmit = useCallback((onValid) => (e) => {
    e?.preventDefault()
    const newErrors = validate(values)
    setTouched(Object.fromEntries(Object.keys(validators).map(k => [k, true])))
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    onValid(values)
  }, [values, validate, validators])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  const setFieldValue = useCallback((field, value) => {
    setValues(v => ({ ...v, [field]: value }))
  }, [])

  return { values, errors, touched, handleChange, handleSubmit, reset, setFieldValue, setValues }
}
