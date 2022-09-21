export interface DynamicSVGImportOptions {
    onCompleted?: (
        name: string,
        SvgIcon: React.FC<React.SVGProps<SVGSVGElement>> | undefined,
    ) => void;
    onError?: React.ReactEventHandler<SVGSVGElement>;
}

export interface IconProps extends React.SVGProps<SVGSVGElement> {
    name: string | undefined;
    type: string | undefined;
    size: number;
    img: string | undefined;
    onCompleted?: DynamicSVGImportOptions["onCompleted"];
    onError?: DynamicSVGImportOptions["onError"];
}
