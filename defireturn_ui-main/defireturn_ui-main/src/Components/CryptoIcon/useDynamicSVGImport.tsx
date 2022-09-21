import React, { useEffect, useRef, useState } from "react";
import { DynamicSVGImportOptions } from "./types/interfaces";

function importAll(r: any) {
	let images: any = {};
  r.keys().forEach((item: any, index: number) => { images[item.replace('./', '')] = r(item); });
	return images
}

const images = importAll((require as any).context('./../../assets', true, /\.(png|jpe?g|svg)$/));

const def = images['svg/crypto/color/generic.svg']


export default function useDynamicSVGImport(
    name: string,
    type: string | undefined,
    options: DynamicSVGImportOptions = {},
) {

    const [url, setUrl] = useState(def.default)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error>();

    const { onCompleted, onError } = options;

    useEffect(() => {
        let t = ""
        
        if(type)
            t = type + "/"

        // setLoading(true);

        let path = images[`svg/crypto/${t}${name}.svg`]

        if(!path && name[0] == 'w'){
            path = images[`svg/crypto/${t}${name.substring(1)}.svg`]
        }
        path = path??def

        setUrl(path.default)

        // const importIcon = async (): Promise<void> => {
            
        //     try {
        //         (ImportedIconRef as any).current = DefaultIcon;
        //         onCompleted?.(name, ImportedIconRef.current);
        //     } catch (err: any) {
        //         console.log({err})
        //         if (err.message.includes("Cannot find module")) {
        //             ImportedIconRef.current = def
        //             onCompleted?.(name, ImportedIconRef.current);
        //         } else {
        //             console.error("IMPORT ERROR", err.message);
        //             onError?.(err);
        //             setError(err);
        //         }
        //     } finally {
        //         setLoading(false);
        //     }
        // };
        // importIcon();
    }, [name, onCompleted, onError]);

    return { error, type, loading, url };
}
