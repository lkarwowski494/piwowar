//
//  PiwowarAudioPlayer.m
//  Piwowar (Brewcraft) — Objective-C Bridge Interface
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(PiwowarAudioPlayer, NSObject)

RCT_EXTERN_METHOD(playAlert:(NSString *)type)

@end
