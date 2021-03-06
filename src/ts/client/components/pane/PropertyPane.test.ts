import {
  ELEM_CONTAINER,
  ELEM_HTML,
  ELEM_SECTION,
  ELEM_SECTION_CONTENT,
  ELEM_TEXT
} from '../../../test-utils/data-set'
import { PropertyPane } from './PropertyPane'
import { fromData } from '../../store/crud-store'
import { getElements, subscribeElements } from '../../element-store'
import { getSite } from '../../site-store'

const [
  ELEM_SECTION_STATE,
  ELEM_SECTION_CONTENT_STATE,
  ELEM_CONTAINER_STATE,
  ELEM_TEXT_STATE,
  ELEM_HTML_STATE,
] =
  fromData([
    ELEM_SECTION,
    ELEM_SECTION_CONTENT,
    ELEM_CONTAINER,
    ELEM_TEXT,
    ELEM_HTML,
])

jest.mock('../../site-store/index', () => ({
  subscribeSite: jest.fn(),
  getSite: () => ({
    width: 1000,
  }),
}))

jest.mock('../../element-store/index', () => ({
  subscribeElements: jest.fn(),
  updateElements: jest.fn(),
  getElements: jest.fn(),
}))

function getValue(selector: string): string {
  return (document.querySelector(selector) as HTMLInputElement).value
}

beforeEach(() => {
  document.body.innerHTML = `
	<span class="position-editor editor-container">
		 <div class="expandable expanded">
				<legend><span class="fa fa-fw fa-inverse fa-caret-down"></span><span>Position and size</span></legend>
				<div class="body">
					 <div class="two-col"><label>X</label><label>W</label></div>
					 <div class="two-col">
							<div class="input-with-unit"><input class="position-input left-input" placeholder="-" type="number" tabindex="1"><label class="unit">PX</label></div>
							<div class="input-with-unit"><input class="position-input width-input" placeholder="-" type="number" tabindex="3" min="0"><label class="unit">PX</label></div>
					 </div>
					 <div class="two-col"><label>Y</label><label>H</label></div>
					 <div class="two-col">
							<div class="input-with-unit"><input class="position-input top-input" placeholder="-" type="number" tabindex="2"><label class="unit">PX</label></div>
							<div class="input-with-unit"><input class="position-input height-input" placeholder="-" type="number" tabindex="4" min="0"><label class="unit">PX</label></div>
					 </div>
				</div>
		 </div>
		 <div class="expandable expanded">
				<legend><span class="fa fa-fw fa-inverse fa-caret-down"></span><span>Layout</span></legend>
				<div class="body">
					 <select class="position-select combobox">
							<option value=""></option>
							<option value="absolute">Absolute</option>
							<option value="static">Automatic</option>
					 </select>
					 <hr>
					 <label class="full-width">Container content flow</label>
					 <select class="display-select combobox">
							<option value=""></option>
							<option value="block">Normal</option>
							<option value="flex">Flex</option>
					 </select>
					 <label class="full-width">Flex flow</label>
					 <div class="two-col">
							<select class="flex-direction-select combobox">
								 <option value=""></option>
								 <option value="row">Row</option>
								 <option value="column">Column</option>
								 <option value="row-reverse">Row reverse</option>
								 <option value="column-reverse">Column reverse</option>
							</select>
							<select class="flex-wrap-select combobox">
								 <option value=""></option>
								 <option value="nowrap">No wrap</option>
								 <option value="wrap">Wrap</option>
								 <option value="wrap-reverse">Wrap reverse</option>
							</select>
							<select class="align-items-select combobox">
								 <option value=""></option>
								 <option value="normal">Normal</option>
								 <option value="stretch">Stretch</option>
								 <option value="center">Center</option>
								 <option value="start">Start</option>
								 <option value="end">End</option>
								 <option value="flex-start">Flex start</option>
								 <option value="flex-end">Flex end</option>
							</select>
							<select class="justify-content-select combobox">
								 <option value=""></option>
								 <option value="normal">Normal</option>
								 <option value="stretch">Stretch</option>
								 <option value="center">Center</option>
								 <option value="start">Start</option>
								 <option value="end">End</option>
								 <option value="flex-start">Flex start</option>
								 <option value="flex-end">Flex end</option>
								 <option value="left">Left</option>
								 <option value="right">Right</option>
								 <option value="space-between">Space between</option>
								 <option value="space-around">Space around</option>
								 <option value="space-evenly">Space evenly</option>
							</select>
					 </div>
					 <hr>
					 <span>Margin</span>
					 <div class="two-col"><label>Left</label><label>Right</label></div>
					 <div class="two-col">
							<div class="input-with-unit"><input class="position-input margin-left-input" placeholder="-" type="number" tabindex="1"><label class="unit">PX</label></div>
							<div class="input-with-unit"><input class="position-input margin-right-input" placeholder="-" type="number" tabindex="3" min="0"><label class="unit">PX</label></div>
					 </div>
					 <div class="two-col"><label>Top</label><label>Bottom</label></div>
					 <div class="two-col">
							<div class="input-with-unit"><input class="position-input margin-top-input" placeholder="-" type="number" tabindex="2"><label class="unit">PX</label></div>
							<div class="input-with-unit"><input class="position-input margin-bottom-input" placeholder="-" type="number" tabindex="4" min="0"><label class="unit">PX</label></div>
					 </div>
				</div>
				<div class="body">
					 <span>Padding</span>
					 <div class="two-col"><label>Left</label><label>Right</label></div>
					 <div class="two-col">
							<div class="input-with-unit"><input class="position-input padding-left-input" placeholder="-" type="number" tabindex="1"><label class="unit">PX</label></div>
							<div class="input-with-unit"><input class="position-input padding-right-input" placeholder="-" type="number" tabindex="3" min="0"><label class="unit">PX</label></div>
					 </div>
					 <div class="two-col"><label>Top</label><label>Bottom</label></div>
					 <div class="two-col">
							<div class="input-with-unit"><input class="position-input padding-top-input" placeholder="-" type="number" tabindex="2"><label class="unit">PX</label></div>
							<div class="input-with-unit"><input class="position-input padding-bottom-input" placeholder="-" type="number" tabindex="4" min="0"><label class="unit">PX</label></div>
					 </div>
				</div>
		 </div>
	</span>
  <span class="seo-editor old-advanced-only editor-container">
     <div class="expandable expanded">
        <legend><span class="fa fa-fw fa-inverse fa-caret-down"></span><span>SEO (search engines)</span></legend>
        <div class="body"><label class="alt-label">Alt (images only)</label><input class="alt-input" placeholder="-" type="text"><label class="title-label">Title and tooltip</label><input class="title-input" placeholder="-" type="text"></div>
     </div>
  </span>
  `
  jest.clearAllMocks()
})

test('init pane', () => {
  const _ = new PropertyPane(document.body)
  expect(subscribeElements).toHaveBeenCalledTimes(1)
})

test('redraw pane for base elements', () => {
	(getElements as any).mockReturnValue([
    ELEM_SECTION_STATE,
    ELEM_SECTION_CONTENT_STATE,
    ELEM_CONTAINER_STATE,
    ELEM_TEXT_STATE,
    ELEM_HTML_STATE,
  ])

  // simple element
  new PropertyPane(document.body).redraw([ELEM_TEXT_STATE])
  expect(getValue('.top-input')).toBe('0')
  expect(getValue('.left-input')).toBe('0')
  expect(getValue('.width-input')).toBe('100')
  expect(getValue('.height-input')).toBe('100')

  // section
  new PropertyPane(document.body).redraw([ELEM_SECTION_STATE])
  expect(getValue('.top-input')).toBe('')
  expect(getValue('.left-input')).toBe('')
  expect(getValue('.width-input')).toBe('')
  expect(getValue('.height-input')).toBe('')

  // section content
  new PropertyPane(document.body).redraw([ELEM_SECTION_CONTENT_STATE])
  expect(getValue('.top-input')).toBe('')
  expect(getValue('.left-input')).toBe('')
  expect(getValue('.width-input')).toBe('1000')
  expect(getValue('.height-input')).toBe('500')
})
