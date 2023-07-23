import * as React from 'react';

const SVGComponent = props => (
  <svg
    className="w-20 h-20"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 400 400"
    {...props}
  >
    <g fillRule="evenodd">
      <path
        className="fill-logo-highlight"
        d="M82.5.292c-1.815.077-3.3.313-3.3.524 0 .211-.99.384-2.2.384-1.21 0-2.2.18-2.2.4 0 .22-.72.4-1.6.4-.88 0-1.6.18-1.6.4 0 .22-.72.4-1.6.4-.909 0-1.6.192-1.6.445 0 .271-.486.374-1.237.264-.803-.118-1.309.007-1.443.355-.113.295-.626.536-1.139.536-.514 0-1.056.197-1.204.438-.149.24-.7.355-1.224.255-.627-.12-.953.004-.953.362 0 .315-.423.545-1 .545-.55 0-1 .18-1 .4 0 .22-.45.4-1 .4s-1 .18-1 .4c0 .22-.45.4-1 .4s-1 .18-1 .4c0 .22-.36.4-.8.4-.44 0-.8.18-.8.4 0 .22-.36.4-.8.4-.44 0-.8.18-.8.4 0 .22-.36.4-.8.4-.44 0-.8.186-.8.414 0 .282-.241.285-.754.011-.607-.325-.743-.269-.7.286.034.428-.211.668-.646.633-.385-.03-.705.15-.71.4-.01.436-2.637 1.856-3.433 1.856-.209 0-.64.36-.957.8-.317.44-.857.8-1.2.8-.343 0-.883.36-1.2.8-.317.44-.857.8-1.2.8-.343 0-.883.36-1.2.8-.317.44-.821.8-1.12.8-.298 0-1.234.72-2.08 1.6-.846.88-1.731 1.6-1.969 1.6a.438.438 0 0 0-.431.443c0 .243-.279.335-.621.204-.341-.131-.517-.07-.39.135.301.488-8.919 9.708-9.407 9.407-.205-.127-.266.049-.135.39.131.342.039.621-.204.621a.443.443 0 0 0-.443.44c0 .241-.54.943-1.2 1.56-.66.617-1.2 1.329-1.2 1.584 0 .255-.18.352-.4.216-.22-.136-.4.084-.4.488 0 .405-.36.995-.8 1.312-.44.317-.8.857-.8 1.2 0 .343-.36.883-.8 1.2-.44.317-.8.857-.8 1.2 0 .343-.36.883-.8 1.2-.44.317-.8.831-.8 1.141 0 .311-.377.892-.837 1.291-.46.399-.719.916-.574 1.15.144.233-.023.533-.371.666-.348.134-.584.538-.525.898.07.425-.153.632-.636.591-.542-.045-.623.057-.3.38.614.614.555 1.212-.095.962-.385-.147-.485.067-.353.758.106.552-.006.963-.262.963-.246 0-.447.36-.447.8 0 .44-.18.8-.4.8-.22 0-.4.36-.4.8 0 .44-.18.8-.4.8-.22 0-.4.45-.4 1s-.18 1-.4 1c-.22 0-.4.45-.4 1s-.18 1-.4 1c-.22 0-.4.45-.4 1 0 .577-.23 1-.545 1-.365 0-.481.329-.353 1 .112.584.005 1-.255 1-.246 0-.447.54-.447 1.2 0 .66-.18 1.2-.4 1.2-.22 0-.4.63-.4 1.4 0 .77-.18 1.4-.4 1.4-.22 0-.4.63-.4 1.4 0 .77-.18 1.4-.4 1.4-.22 0-.4.81-.4 1.8s-.18 1.8-.4 1.8c-.22 0-.4.975-.4 2.167 0 1.377-.182 2.227-.5 2.333-.736.245-.736 241.155 0 241.4.318.106.5.956.5 2.333 0 1.192.18 2.167.4 2.167.22 0 .4.81.4 1.8s.18 1.8.4 1.8c.22 0 .4.63.4 1.4 0 .77.18 1.4.4 1.4.22 0 .4.63.4 1.4 0 .77.18 1.4.4 1.4.22 0 .4.54.4 1.2 0 .66.18 1.2.4 1.2.22 0 .4.45.4 1s.18 1 .4 1c.22 0 .4.45.4 1s.18 1 .4 1c.22 0 .4.45.4 1s.18 1 .4 1c.22 0 .4.45.4 1s.18 1 .4 1c.22 0 .4.36.4.8 0 .44.18.8.4.8.22 0 .4.36.4.8 0 .44.18.8.4.8.22 0 .4.36.4.8 0 .44.199.8.443.8.243 0 .336.277.207.615-.132.344.014.712.331.833a.61.61 0 0 1 .351.785c-.12.312-.034.567.19.567.223 0 .819.855 1.324 1.9.504 1.045 1.24 2.249 1.636 2.675.395.427.718 1.012.718 1.3 0 .289.15.525.332.525.183 0 .587.495.898 1.1.31.605.881 1.391 1.267 1.747.387.356.703.848.703 1.094 0 .246.855 1.356 1.9 2.468 4.078 4.338 12.847 13.191 13.067 13.191.128 0 .974.72 1.881 1.6.907.88 1.857 1.6 2.112 1.6.255 0 .723.36 1.04.8.317.44.857.8 1.2.8.343 0 .883.36 1.2.8.317.44.857.8 1.2.8.343 0 .883.36 1.2.8.317.44.897.8 1.288.8.392 0 .712.162.712.361 0 .198.54.549 1.2.779.66.23 1.2.616 1.2.857s.315.385.7.321c.456-.077.681.122.646.571-.043.555.093.611.7.286.513-.274.754-.271.754.011 0 .228.36.414.8.414.44 0 .8.18.8.4 0 .22.36.4.8.4.44 0 .8.18.8.4 0 .22.36.4.8.4.44 0 .8.18.8.4 0 .22.45.4 1 .4s1 .18 1 .4c0 .22.45.4 1 .4s1 .18 1 .4c0 .22.45.4 1 .4.577 0 1 .23 1 .545 0 .365.329.481 1 .353.584-.112 1-.005 1 .255 0 .246.521.447 1.157.447.637 0 1.25.241 1.363.536.134.348.64.473 1.443.355.751-.11 1.237-.007 1.237.264 0 .254.698.445 1.624.445.98 0 1.525.158 1.376.4-.151.244.463.4 1.576.4 1.003 0 1.824.18 1.824.4 0 .22.975.4 2.167.4 1.377 0 2.227.182 2.333.5.245.736 241.155.736 241.4 0 .106-.318.956-.5 2.333-.5 1.192 0 2.167-.18 2.167-.4 0-.22.81-.4 1.8-.4s1.8-.18 1.8-.4c0-.22.63-.4 1.4-.4.77 0 1.4-.18 1.4-.4 0-.22.63-.4 1.4-.4.77 0 1.4-.18 1.4-.4 0-.22.54-.4 1.2-.4.66 0 1.2-.201 1.2-.447 0-.26.416-.367 1-.255.671.128 1 .012 1-.353 0-.315.423-.545 1-.545.55 0 1-.18 1-.4 0-.22.45-.4 1-.4s1-.18 1-.4c0-.22.45-.4 1-.4s1-.18 1-.4c0-.22.36-.4.8-.4.44 0 .8-.18.8-.4 0-.22.36-.4.8-.4.44 0 .8-.18.8-.4 0-.22.36-.4.8-.4.44 0 .8-.174.8-.387 0-.214.268-.285.597-.159.335.129.7-.041.833-.387.13-.339.468-.528.751-.419.284.109.631-.101.771-.467.14-.365.495-.572.789-.459.294.113.783-.138 1.085-.558.303-.42.871-.764 1.262-.764.392 0 .712-.18.712-.4 0-.22.27-.4.6-.4.33 0 .6-.18.6-.4 0-.22.23-.4.512-.4.281 0 .771-.36 1.088-.8.317-.44.857-.8 1.2-.8.343 0 .883-.36 1.2-.8.317-.44.785-.8 1.04-.8s1.205-.72 2.112-1.6c.907-.88 1.829-1.6 2.048-1.6.22 0 .4-.18.4-.4 0-.22.27-.4.6-.4.33 0 .6-.173.6-.385 0-.416 7.783-8.232 9.164-9.203.46-.324.836-.819.836-1.1 0-.281.72-1.253 1.6-2.16.88-.907 1.6-1.857 1.6-2.112 0-.255.36-.723.8-1.04.44-.317.8-.831.8-1.141 0-.311.316-.856.703-1.212.386-.356.957-1.142 1.267-1.747.311-.605.715-1.1.898-1.1.182 0 .332-.36.332-.8 0-.44.162-.8.361-.8.198 0 .549-.54.779-1.2.23-.66.627-1.2.882-1.2s.36-.27.233-.6c-.145-.378.005-.6.404-.6.437 0 .569-.248.425-.8-.115-.44-.046-.8.153-.8.2 0 .363-.36.363-.8 0-.44.18-.8.4-.8.22 0 .4-.36.4-.8 0-.44.18-.8.4-.8.22 0 .4-.36.4-.8 0-.44.18-.8.4-.8.22 0 .4-.45.4-1s.18-1 .4-1c.22 0 .4-.45.4-1s.18-1 .4-1c.22 0 .4-.45.4-1 0-.577.23-1 .545-1 .365 0 .481-.329.353-1-.112-.584-.005-1 .255-1 .246 0 .447-.54.447-1.2 0-.66.18-1.2.4-1.2.22 0 .4-.63.4-1.4 0-.77.18-1.4.4-1.4.22 0 .4-.619.4-1.376 0-.757.18-1.488.4-1.624.22-.136.4-.957.4-1.824 0-.867.18-1.576.4-1.576.22 0 .4-.975.4-2.167 0-1.377.182-2.227.5-2.333.399-.133.5-24.629.5-120.7s-.101-120.567-.5-120.7c-.318-.106-.5-.956-.5-2.333 0-1.192-.18-2.167-.4-2.167-.22 0-.4-.821-.4-1.824 0-1.113-.156-1.727-.4-1.576-.242.149-.4-.396-.4-1.376 0-.893-.18-1.624-.4-1.624-.22 0-.4-.63-.4-1.4 0-.77-.18-1.4-.4-1.4-.22 0-.4-.54-.4-1.2 0-.66-.201-1.2-.447-1.2-.26 0-.367-.416-.255-1 .128-.671.012-1-.353-1-.315 0-.545-.423-.545-1 0-.55-.18-1-.4-1-.22 0-.4-.45-.4-1s-.18-1-.4-1c-.22 0-.4-.45-.4-1s-.18-1-.4-1c-.22 0-.4-.36-.4-.8 0-.44-.18-.8-.4-.8-.22 0-.4-.36-.4-.8 0-.44-.164-.8-.365-.8-.201 0-.485-.715-.633-1.589-.149-.881-.476-1.549-.735-1.5-.257.049-.419-.206-.36-.565.059-.36-.177-.764-.525-.898-.348-.133-.538-.396-.421-.585.116-.188-.142-.722-.575-1.186-.432-.464-.786-1.081-.786-1.372 0-.291-.36-.788-.8-1.105-.44-.317-.8-.857-.8-1.2 0-.343-.36-.883-.8-1.2-.44-.317-.8-.857-.8-1.2 0-.343-.36-.883-.8-1.2-.44-.317-.8-.821-.8-1.12 0-.298-.72-1.234-1.6-2.08-.88-.846-1.6-1.649-1.6-1.786 0-.333-11.468-11.814-11.801-11.814-.144 0-.953-.72-1.799-1.6-.846-.88-1.782-1.6-2.08-1.6-.299 0-.803-.36-1.12-.8-.317-.44-.831-.8-1.141-.8-.311 0-.856-.316-1.212-.703-.356-.386-1.142-.957-1.747-1.267-.605-.311-1.1-.715-1.1-.898 0-.182-.283-.332-.629-.332-.345 0-.898-.27-1.228-.6-.33-.33-.947-.6-1.372-.6-.424 0-.771-.264-.771-.587 0-.357-.235-.498-.597-.359-.345.133-.704-.051-.851-.435-.14-.366-.502-.57-.804-.455-.301.116-.548.037-.548-.177 0-.213-.36-.387-.8-.387-.44 0-.8-.18-.8-.4 0-.22-.36-.4-.8-.4-.44 0-.8-.18-.8-.4 0-.22-.36-.4-.8-.4-.44 0-.8-.18-.8-.4 0-.22-.45-.4-1-.4s-1-.18-1-.4c0-.22-.45-.4-1-.4s-1-.18-1-.4c0-.22-.45-.4-1-.4s-1-.18-1-.4c0-.22-.45-.4-1-.4s-1-.18-1-.4c0-.22-.54-.4-1.2-.4-.66 0-1.2-.18-1.2-.4 0-.22-.63-.4-1.4-.4-.77 0-1.4-.18-1.4-.4 0-.22-.72-.4-1.6-.4-.88 0-1.6-.18-1.6-.4 0-.22-.72-.4-1.6-.4-.88 0-1.6-.18-1.6-.4 0-.22-.975-.4-2.167-.4-1.377 0-2.227-.182-2.333-.5C320.545.236 93.022-.154 82.5.292m233.133 15.679c1.192.204 3.427.582 4.967.841 31.77 5.332 57.861 32.219 63.095 65.02.747 4.687.739 231.685-.009 236.434-5.295 33.618-31.802 60.125-65.42 65.42-4.749.748-231.747.756-236.434.009-32.834-5.239-59.586-31.201-65.014-63.095l-.847-4.967c-.497-2.905-.497-228.361 0-231.266.204-1.192.582-3.427.841-4.967 1.26-7.511 5.657-19.398 9.171-24.8.573-.88 1.271-2.057 1.552-2.616.46-.916 1.981-3.039 5.118-7.145 1.425-1.865 10.321-10.761 12.186-12.186 4.106-3.137 6.229-4.658 7.145-5.118.559-.281 1.736-.979 2.616-1.552 5.333-3.47 17.283-7.909 24.6-9.138 1.43-.24 3.5-.597 4.6-.794 2.721-.485 229.008-.564 231.833-.08M189.4 67.64c-1.32.189-3.93.543-5.8.787-1.87.245-4.03.593-4.8.774-.77.181-2.39.533-3.6.781-29.843 6.123-53.285 24.499-61.005 47.818-5.54 16.735-3.917 38.775 3.905 53 4.55 8.276 9.1 13.356 19.154 21.391 4.991 3.988 19.65 11.902 28.546 15.411 1.76.694 3.74 1.497 4.4 1.783.66.287 1.83.74 2.6 1.008s1.76.631 2.2.807c.44.176 1.43.536 2.2.8.77.264 1.76.635 2.2.824.939.402 8.774 2.926 15.6 5.025 21.971 6.756 34.549 14.237 38.751 23.047 3.586 7.519 3.547 17.883-.096 25.504-1.399 2.926-8.065 10.4-9.276 10.4-.239 0-1.187.505-2.107 1.123-12.724 8.545-44.945 8.288-64.901-.518-.754-.333-2.046-.9-2.871-1.261-8.141-3.561-15.531-8.047-22.612-13.727-3.912-3.138-4.282-3.259-5.444-1.782-.448.57-2.306 2.682-4.129 4.695-6.017 6.641-7.313 8.068-7.515 8.27-.11.11-1.73 1.908-3.6 3.996s-3.76 4.171-4.2 4.629c-.44.458-1.97 2.158-3.4 3.777a508.409 508.409 0 0 1-3.898 4.371c-1.748 1.922-1.5 2.33 4.298 7.07.77.629 1.49 1.252 1.6 1.384.854 1.023 12.839 9.573 13.42 9.573.141 0 .734.333 1.318.74 1.022.713 6.397 3.697 8.462 4.698 1.046.507 2.673 1.23 7.482 3.322 6.602 2.871 19.491 6.558 28.018 8.013 6.023 1.028 7.309 1.217 10.9 1.602 15.408 1.651 30.524 1.531 44-.352 7.489-1.045 13.657-2.392 20.2-4.41 42.784-13.193 64.494-47.536 56.776-89.813-.524-2.869-2.26-9.403-2.976-11.2-4.677-11.742-12.124-21.833-21.2-28.727-1.21-.919-2.29-1.773-2.4-1.898-.329-.374-3.61-2.544-6.6-4.365-3.408-2.075-17.868-9.21-18.667-9.21-.315 0-.744-.152-.953-.339-.209-.186-1.91-.923-3.78-1.638-1.87-.714-3.76-1.454-4.2-1.642-1.014-.435-8.482-2.887-17-5.582-7.847-2.482-18.331-6.165-22.2-7.796l-4.8-2.024c-13.605-5.736-19.55-12.784-19.55-23.179 0-9.048 4.495-15.686 13.616-20.104 2.365-1.145 2.841-1.324 5.734-2.15 10.23-2.919 25.738-3.07 36.4-.354 7.509 1.913 9.549 2.545 14.2 4.399 6.741 2.687 14.845 7.358 21.4 12.335 3.008 2.284 2.359 2.61 8.127-4.083.399-.464 1.659-1.907 2.8-3.207l2.673-3.049c.33-.376 1.5-1.74 2.6-3.03 1.1-1.29 2.72-3.153 3.6-4.14l2.857-3.206c.691-.776 2.729-3.118 4.529-5.203l3.273-3.793-1.929-1.812a74.696 74.696 0 0 0-3.677-3.208c-.961-.767-1.951-1.582-2.2-1.809-4.668-4.272-19.055-12.522-27.453-15.744-1.87-.717-3.713-1.47-4.095-1.673-.382-.203-1.046-.369-1.476-.369-.43 0-.893-.18-1.029-.4-.136-.22-.599-.4-1.029-.4-.43 0-1.094-.171-1.476-.38-.798-.436-4.004-1.264-10.295-2.657-7.299-1.617-7.831-1.703-18.2-2.954-4.029-.486-27.952-.462-31.4.031"
      />
      <path
        className="fill-logo-background"
        d="M84.2 16.628c-35.406 4.273-63.396 32.43-67.582 67.985-.923 7.838-.923 222.936 0 230.774 1.105 9.387 3.241 16.631 7.434 25.213 8.283 16.954 23.155 30.782 40.748 37.889a26.6 26.6 0 0 1 1.695.758c.382.194 1.021.353 1.42.353s.896.149 1.105.33c.468.407 3.629 1.302 8.58 2.429 6.415 1.461 4.726 1.441 122.4 1.441 91.69 0 115.2-.103 117.6-.515 2.894-.498 4.225-.775 8.3-1.73 1.99-.467 6.063-1.743 7.6-2.381.495-.206 1.305-.535 1.8-.731 10.233-4.06 21.288-11.834 28.787-20.243 3.374-3.783 9.113-11.679 9.113-12.537 0-.218.137-.456.305-.53.284-.124 4.157-7.829 4.942-9.833.194-.495.521-1.305.727-1.8.633-1.525 1.913-5.606 2.353-7.5 1.077-4.644 1.276-5.595 1.758-8.4.412-2.4.515-25.947.515-117.8 0-123.8.121-115.623-1.829-123.8a55.503 55.503 0 0 1-.644-3.104c-.119-.717-.376-1.402-.571-1.523-.196-.121-.356-.649-.356-1.173s-.18-1.064-.4-1.2c-.22-.136-.4-.599-.4-1.029a3.88 3.88 0 0 0-.353-1.476 26.6 26.6 0 0 1-.758-1.695c-5.882-14.562-16.154-27.015-29.967-36.329-1.363-.919-2.653-1.671-2.867-1.671-.213 0-.448-.141-.522-.313-.123-.289-5.866-3.193-9.133-4.619-5.336-2.329-13.531-4.416-20.613-5.25-7.243-.853-224.115-.843-231.187.01m133.886 50.181c9.585.954 13.345 1.511 20.714 3.067 6.55 1.383 15.996 4.247 18.938 5.742.846.43 1.881.782 2.3.782.419 0 .762.18.762.4 0 .22.261.4.581.4 3.548 0 23.653 12.872 30.796 19.716 2.42 2.319 2.638 1.633-2.299 7.247a735.063 735.063 0 0 0-3.478 3.983c-.77.891-2.21 2.54-3.2 3.665a822.555 822.555 0 0 0-3.986 4.575c-1.203 1.391-2.376 2.729-2.606 2.972-.231.243-1.407 1.607-2.614 3.032-2.046 2.415-2.824 3.302-6.455 7.361-1.614 1.803-2.135 1.761-4.495-.368-.855-.772-2.07-1.708-2.7-2.08-.629-.371-1.144-.817-1.144-.989 0-.173-.19-.314-.422-.314-.232 0-1.511-.74-2.842-1.644-1.331-.904-3.346-2.136-4.478-2.738A228.128 228.128 0 0 1 248 119.74c-1.979-1.109-8.883-3.9-12.2-4.934-24.229-7.549-48.997-4.772-58.882 6.601-1.562 1.798-1.94 2.415-2.811 4.593-.22.55-.59 1.45-.822 2-1.21 2.869-1.273 10.031-.114 13 1.925 4.932 3.686 7.273 7.779 10.34 2.968 2.225 12.221 7.06 13.509 7.06.408 0 .741.18.741.4 0 .22.324.4.72.4.396 0 .891.143 1.1.318.209.175 1.1.547 1.98.827.88.279 2.05.7 2.6.935 1.104.471 1.909.768 4 1.472l6 2.022c2.53.853 7.84 2.572 11.8 3.821 3.96 1.248 7.56 2.423 8 2.611.44.188 1.97.728 3.4 1.201 1.43.473 3.363 1.205 4.296 1.626.932.422 1.86.767 2.062.767.201 0 1.148.386 2.104.857.956.471 2.098.992 2.538 1.158 3.085 1.162 13.772 6.438 15.462 7.634.584.413 1.178.751 1.321.751.309 0 5.928 3.617 6.217 4.002.11.146.491.431.846.632 4.518 2.559 14.911 13.386 17.886 18.632.416.734 1.28 2.234 1.92 3.334 1.161 1.997 2.738 5.198 3.399 6.9.192.495.517 1.305.723 1.8.205.495.59 1.62.855 2.5.265.88.618 1.96.785 2.4.166.44.516 1.88.777 3.2.261 1.32.626 3.12.812 4 1.308 6.188 1.568 23.728.436 29.4-.241 1.21-.629 3.1-.861 4.2a108.02 108.02 0 0 0-.644 3.304c-.122.717-.383 1.402-.578 1.523-.196.121-.356.624-.356 1.117s-.143 1.067-.318 1.276c-.175.209-.548 1.1-.828 1.98-.28.88-.879 2.41-1.332 3.4-.453.99-1.025 2.25-1.272 2.8-3.509 7.829-11.957 18.321-19.85 24.653-3.104 2.49-7.76 5.747-8.216 5.747-.143 0-.805.388-1.471.862-2.065 1.47-9.104 4.911-13.713 6.703-2.42.94-4.76 1.853-5.2 2.027-.44.174-1.61.535-2.6.801-.99.267-2.113.647-2.495.846-.382.199-1.136.361-1.676.361s-1.081.161-1.203.358c-.121.197-.897.455-1.723.574a57.04 57.04 0 0 0-3.503.663c-15.493 3.464-40.393 4.149-58.6 1.613-7.636-1.064-14.788-2.61-22.6-4.887-1.54-.449-3.16-.963-3.6-1.142-.44-.18-1.97-.721-3.4-1.202-3.89-1.311-10.965-4.322-14-5.958-.77-.415-2.21-1.175-3.2-1.687-.99-.513-1.89-1.022-2-1.132-.396-.396-2.615-1.654-3.3-1.871-.385-.122-.7-.381-.7-.576 0-.194-.19-.353-.422-.353-1.615 0-19.226-13.976-19.658-15.6-.127-.478 7.418-9.418 10.466-12.401.338-.33 1.961-2.13 3.607-4 1.646-1.869 3.266-3.669 3.6-3.999.334-.33 1.309-1.41 2.166-2.4.858-.99 2.392-2.7 3.41-3.8 1.018-1.1 2.819-3.125 4.001-4.5 2.323-2.701 2.678-2.864 3.935-1.8 1.823 1.542 2.472 2.064 4.933 3.968 6.672 5.164 15.293 10.074 23.562 13.421.55.222 1.313.563 1.695.758a3.88 3.88 0 0 0 1.476.353c.43 0 .893.18 1.029.4.136.22.599.4 1.029.4.43 0 1.094.162 1.476.361.382.199 1.505.571 2.495.827.99.256 2.353.634 3.028.839.676.205 1.7.373 2.277.373.576 0 1.145.157 1.264.35.119.192 1.255.472 2.524.622 1.269.15 3.567.444 5.107.654 9.284 1.264 22.425.877 29.8-.878 3.399-.808 3.774-.93 6.406-2.081.773-.339 1.853-.804 2.4-1.034 5.373-2.261 11.33-7.807 13.569-12.633 1.662-3.582 1.998-4.756 2.463-8.592 1.898-15.663-5.944-26.164-25.138-33.657-.495-.193-1.35-.531-1.9-.751-.55-.22-1.405-.556-1.9-.746-.495-.191-1.35-.525-1.9-.742-1.706-.673-4.82-1.72-9.4-3.16-10.98-3.453-20.934-6.786-23.4-7.834a73.234 73.234 0 0 0-1.9-.772l-1.8-.692c-3.476-1.339-5.512-2.265-13.3-6.055-3.74-1.82-7.748-3.915-8.908-4.654-1.159-.74-2.204-1.345-2.322-1.345-.275 0-4.853-3.077-6.199-4.167a81.627 81.627 0 0 0-2.383-1.833c-10.288-7.592-21.988-24.34-21.988-31.475 0-.483-.161-.977-.358-1.099-.197-.121-.457-.897-.579-1.723a88.406 88.406 0 0 0-.668-3.703c-1.487-7.341-1.178-27.661.446-29.38.197-.209.359-.963.359-1.676s.18-1.408.4-1.544c.22-.136.4-.689.4-1.229 0-.54.166-1.294.368-1.676.202-.382.775-1.775 1.273-3.095 2.239-5.939 7.051-13.751 11.357-18.437l2.076-2.263c5.073-5.532 14.692-12.411 22.526-16.109 1.65-.778 3.313-1.59 3.695-1.803.382-.214.967-.388 1.3-.388.333 0 .605-.18.605-.4 0-.22.362-.4.805-.4.443 0 1.118-.159 1.5-.353 5.887-2.995 19.923-6.22 33.095-7.604 4.654-.489 21.492-.511 26.286-.034"
      />
    </g>
  </svg>
);

export default SVGComponent;
