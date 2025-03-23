import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


  
export function NodeList({type, initContents}) {
  const [contents, setContents] = useState(initContents);
    useEffect(() => {
      setContents(initContents);
    }, [initContents]);

    return (
        <>
        <ol>
          {contents.map((content)=> (
           
              <li key={content.id}>
                <div className="gap-4 mt-4">
                  <Badge variant="secondary" className="p-2 w-full min-h-15 hover:bg-gray-700 hover:text-gray-200 cursor-pointer transition-colors duration-200">
                    <div className="flex justify-start gap-4 w-full max-w-3xl">
                      <div className="w-1/4">
                        <Avatar>
                          <AvatarImage src="https://github.com/shadcn.png" />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="text-2xl w-3/4 flex items-center justify-start text-center">
                      <p className="m-0 leading-none">{content.properties.name}</p>
                      </div>
                    </div>
    
                  </Badge>
                </div>
              </li>
          ))}
          </ol>
      </>
    );
}