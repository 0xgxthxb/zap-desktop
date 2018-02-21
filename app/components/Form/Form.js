import React from 'react'
import PropTypes from 'prop-types'

import Isvg from 'react-inlinesvg'
import { MdClose } from 'react-icons/lib/md'

import Pay from './Pay'
import PayForm from './PayForm'
import RequestForm from './RequestForm'

import x from 'icons/x.svg'
import styles from './Form.scss'

const FORM_TYPES = {
  // PAY_FORM: PayForm,
  PAY_FORM: Pay,
  REQUEST_FORM: RequestForm
}

const Form = ({ formType, formProps, closeForm }) => {
  if (!formType) { return null }

  const FormComponent = FORM_TYPES[formType]
  return (
    <div className={`${styles.container} ${formType && styles.open}`}>
      <div className={styles.closeContainer}>
        <span onClick={closeForm}>
          <Isvg src={x} />
        </span>
      </div>
      <FormComponent {...formProps} />
    </div>
  )
}


Form.propTypes = {
  formType: PropTypes.string,
  formProps: PropTypes.object.isRequired,
  closeForm: PropTypes.func.isRequired
}

export default Form
