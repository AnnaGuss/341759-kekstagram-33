import { isEscapeKey } from './util.js';
import './../vendor/pristine/pristine.min.js';
import './effects.js';
import { image, sliderUpload, resetScale } from './effects.js';

const MAX_DESCRIPTION = 140;
const MAX_DESCRIPTION_HASHTAGS = 20;
const MAX_HASHTAGS = 5;

const FILE_TYPES = ['jpg', 'jpeg', 'png'];

const form = document.querySelector('.img-upload__form');
const inputPhotoElement = form.querySelector('.img-upload__input');
const previewNewPhoto = form.querySelector('.img-upload__overlay');
const buttonCancelForm = form.querySelector('.img-upload__cancel');
const descriptionForm = form.querySelector('.text__description');
const hashtagsForm = form.querySelector('.text__hashtags');
const publicet = form.querySelector('.img-upload__submit');

const pristine = new Pristine(form, {
  classTo: 'img-upload__field-wrapper',
  errorClass: 'img-upload__field-wrapper--invalid',
  successClass: 'img-upload__field-wrapper--valid',
  errorTextParent: 'img-upload__field-wrapper',
  errorTextTag: 'div',
  errorTextClass: 'img-upload__field-wrapper--error',
});

const inputHashtag = document.querySelector('.text__hashtags');

let errorMessage = '';

const error = () => errorMessage;

const hashtagsHandler = (value) => {
  errorMessage = '';

  const inputText = value.toLowerCase().trim();
  if (!inputText) {
    return true;
  }

  const inputArray = inputText.split(/\s+/);
  if (inputArray.length === 0) {
    return true;
  }

  const rules = [
    {
      check: inputArray.some((item) => item.indexOf('#', 1) >= 1),
      error: 'Хэштеги разделяются пробелами',
    },
    {
      check: inputArray.some((item) => item[0] !== '#'),
      error: 'Хэштег начинается с символа #',
    },
    {
      check: inputArray.some((item, num, arr) => arr.includes(item, num + 1)),
      error: 'Один и тот же хэштег не может быть использован дважды',
    },
    {
      check: inputArray.some((item) => item.length > MAX_DESCRIPTION_HASHTAGS),
      error: `Длина хэштега не может составлять больше ${MAX_DESCRIPTION_HASHTAGS} символов`,
    },
    {
      check: inputArray.length > MAX_HASHTAGS,
      error: `Нельзя указывать больше ${ MAX_HASHTAGS } хэштегов`,
    },
    {
      check: inputArray.some((item) => !/^#[a-zа-яё0-9]{1,19}$/i.test(item)),
      error: 'Хэштег содержит недопустимые символы',
    },
  ];

  return rules.every((rule) => {
    const isInvalid = rule.check;
    if (isInvalid) {
      errorMessage = rule.error;
    }
    return !isInvalid;
  });
};

function validateDescriptionLength (value) {
  return value.length <= MAX_DESCRIPTION;
}

pristine.addValidator(
  descriptionForm,
  validateDescriptionLength,
  `Длина комментария больше ${ MAX_DESCRIPTION } символов`
);

pristine.addValidator(inputHashtag, hashtagsHandler, error, 2, false);

const onHashtagInput = () => {
  if (pristine.validate()) {
    publicet.disabled = false;
  } else {
    publicet.disabled = true;
  }
};

inputHashtag.addEventListener('input', onHashtagInput);

form.addEventListener('submit', (evt) => {
  if (!pristine.validate()) {
    evt.preventDefault();
  }
});

const onDocumentKeydown = (evt) => {
  if (isEscapeKey(evt) && !document.querySelector('.error')) {
    evt.preventDefault();
    close();
  }
};

function close () {
  document.body.classList.remove('modal-open');
  previewNewPhoto.classList.add('hidden');
  document.removeEventListener('keydown', onDocumentKeydown);
  image.style.transform = 'none';
  image.style.filter = 'none';
  sliderUpload.classList.add('visually-hidden');
  form.reset();
  pristine.reset();
  resetScale();
}

const open = () => {
  document.body.classList.add('modal-open');
  previewNewPhoto.classList.remove('hidden');
  document.addEventListener('keydown', onDocumentKeydown);
};

form.addEventListener('change', open);

buttonCancelForm.addEventListener('click', close);

const onTextFieldFocus = (evt) => {
  evt.stopPropagation();
};

const onChooseFileBtnClick = () => {
  open();

  const file = inputPhotoElement.files[0];
  const isCorrectFileType = FILE_TYPES.some((item) => file.name.toLowerCase().endsWith(item));
  if (isCorrectFileType) {
    image.src = URL.createObjectURL(file);
  }
  form.querySelectorAll('.effects__preview').forEach((item) => {
    item.style.backgroundImage = `url(${URL.createObjectURL(file)})`;
  });
};

descriptionForm.addEventListener('keydown', onTextFieldFocus);
hashtagsForm.addEventListener('keydown', onTextFieldFocus);
inputPhotoElement.addEventListener('change', onChooseFileBtnClick);

export { form, pristine, close };
