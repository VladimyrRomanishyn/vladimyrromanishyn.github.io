
export enum SectionsEnum {
    common = 'Common',
    structure = 'Structure',
}


export interface Section {
    name: string,
    value: SectionsEnum,
    stylesFormCofig: Array<StylesFormConfig>
}

export type CSSProperty =
    | 'width' | 'height' | 'margin' | 'padding' | 'border' | 'background' 
    | 'border-radius' | 'box-shadow' | 'margin-left' | 'margin-top' 
    | 'padding-left' | 'padding-top' | 'opacity' | 'zoom' | 'display'
    | 'flex-direction' | 'flex-wrap' | 'flex-flow' | 'justify-content'
    | 'gap' | 'order' | 'flex-grow' | 'flex-shrink' | 'flex-basis'| 'flex'
    | 'align-self' | 'align-items' | 'align-content' ;

export type ValueType = 'percentage' | 'pixels' | 'short' | 'shortWithColorPicker' | 'dropdown';

export type FormControlsShape = {
    changed: boolean;
    update: boolean;
    value: string | boolean | number;
    color?: string;
    options?: Array<string[]>;
    maxValue?: number;
    minValue?: number;
    styleValue: string;
    controlChecker: (control: FormControlsShape, prevControl: FormControlsShape) => void;
};

export type StylesFormConfig = {
    property: CSSProperty,
    valueTypes: Array<[ValueType, FormControlsShape]>
};

export type StyleFormValue = {
    nodeStyles: Array<StyleFormPropertyValue>
};

export type StyleFormPropertyValue = {
    [key in CSSProperty]: Array<{
        [key in ValueType]: FormControlsShape
    }>
}