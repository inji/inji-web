import React from 'react';
import LogomarkImage from '../../assets/Logomark.png';

interface BackgroundDecoratorProps {
    circleCount?: number;
    topOffset?: number;
    baseRadius?: number;
    testId?: string;
}

export const BackgroundDecorator: React.FC<BackgroundDecoratorProps> = ({
                                                                            circleCount = 6,
                                                                            topOffset = 73,
                                                                            baseRadius = 96,
                                                                            testId = 'background-decorator',
                                                                        }) => {
    return (
        <div
            className="overflow-hidden absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
            data-testid={testId}
        >
            <div
                className={`absolute`}
                style={{top: `${topOffset}px`}}
            >
                {[...new Array(circleCount)].map((_, index) => {
                    const radius = baseRadius + index * baseRadius;
                    const opacity = 0.8 - index * 0.1;
                    return (
                        <div
                            key={index}
                            className="absolute rounded-full border overflow-hidden"
                            style={{
                                width: `${radius}px`,
                                height: `${radius}px`,
                                borderWidth: '1px',
                                borderColor: `rgba(228, 231, 236, ${opacity})`,
                                top: `calc(50% - ${radius / 2}px)`,
                                left: `calc(50% - ${radius / 2}px)`
                            }}
                            data-testid={`${testId}-circle-${index}`}
                        />
                    );
                })}

                <div
                    className="flex items-center justify-center"
                    data-testid={"logo-inji-web-container"}
                >
                    <img src={LogomarkImage} alt={"Inji Web Logo"}
                         data-testid={"logo-inji-web"}/>
                </div>
            </div>
        </div>
    );
};
